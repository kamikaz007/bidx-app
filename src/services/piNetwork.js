class PiNetworkService {
  constructor() {
    this.user = null;
    this.payments = [];
    this.initialized = false;
    this.isPiBrowser = false;
    this.apiUrl = '/api';
    this.sandboxMode = true;
    
    // Pi OAuth Config
    this.oauthConfig = {
      clientId: 'IJQxbOZlWZeaFUBtX8qlY6z8ufMFK5gs0jpYILywt8M',
      redirectUri: window.location.origin + '/auth/callback',
      scopes: ['username', 'payments', 'wallet_address'],
      sandbox: true
    };
  }

  async initialize() {
    try {
      this.isPiBrowser = typeof window.Pi !== 'undefined';
      
      if (this.isPiBrowser) {
        await window.Pi.init({
          version: "2.0",
          sandbox: this.sandboxMode
        });
        console.log('✅ Pi SDK initialized');
      } else {
        console.log('🌐 Regular browser - OAuth mode available');
      }
      
      this.initialized = true;
      return { 
        success: true, 
        mode: this.isPiBrowser ? 'pi-browser' : 'browser',
        sandbox: this.sandboxMode
      };
    } catch (error) {
      console.error('Init error:', error);
      this.initialized = true;
      return { success: false, error: error.message };
    }
  }

  // Pi Sign-In (OAuth) - الطريقة الجديدة
  async signInWithPi() {
    try {
      console.log('🟣 Starting Pi Sign-In...');
      
      // في Pi Browser - استخدام SDK مباشرة
      if (this.isPiBrowser && window.Pi) {
        return await this.authenticateWithSDK();
      }
      
      // في المتصفح العادي - استخدام OAuth Redirect
      return await this.authenticateWithOAuth();
      
    } catch (error) {
      console.error('Sign-In error:', error);
      throw error;
    }
  }

  // مصادقة SDK (Pi Browser)
  async authenticateWithSDK() {
    const scopes = ['username', 'payments', 'wallet_address'];
    
    const authResult = await window.Pi.authenticate(scopes, {
      onIncompletePaymentFound: (payment) => {
        console.log('🔄 Incomplete payment:', payment);
        this.completePayment(payment.identifier, payment.transaction?.txid);
      }
    });

    const userData = this.formatUserData(authResult.user, 'pi-browser');
    this.user = userData;
    return userData;
  }

  // مصادقة OAuth (متصفح عادي)
  async authenticateWithOAuth() {
    // بناء رابط OAuth
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      response_type: 'code',
      scope: this.oauthConfig.scopes.join(' '),
      state: this.generateState()
    });

    const oauthUrl = `https://socialchain.app/oauth/authorize?${params.toString()}`;
    
    console.log('🔗 OAuth URL:', oauthUrl);
    
    // تخزين حالة OAuth
    localStorage.setItem('pi_oauth_state', params.get('state'));
    
    // توجيه المستخدم لصفحة موافقة Pi
    window.location.href = oauthUrl;
    
    // هذا لن ينفذ حتى يعود المستخدم
    return null;
  }

  // معالجة OAuth Callback
  async handleOAuthCallback(code, state) {
    try {
      const savedState = localStorage.getItem('pi_oauth_state');
      
      if (state !== savedState) {
        throw new Error('Invalid OAuth state');
      }
      
      console.log('🔑 Exchanging code for token...');
      
      // تبادل الكود بـ access token عبر الخادم
      const response = await fetch(`${this.apiUrl}/pi-oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          clientId: this.oauthConfig.clientId,
          redirectUri: this.oauthConfig.redirectUri
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'OAuth failed');
      }

      // إنشاء بيانات المستخدم
      const userData = this.formatUserData(data.user, 'oauth');
      this.user = userData;
      
      // تنظيف
      localStorage.removeItem('pi_oauth_state');
      
      return userData;
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  // مصادقة (الطريقة القديمة - للتوافق)
  async authenticate() {
    try {
      if (this.isPiBrowser && window.Pi) {
        return await this.authenticateWithSDK();
      }
      
      // حساب تجريبي للتطوير
      const mockUser = {
        uid: 'dev_user_' + Date.now(),
        username: 'مطور_تجريبي',
        walletAddress: 'GDEV' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        kycStatus: 'passed',
        isVerified: true,
        country: 'TN',
        loginMethod: 'sandbox-dev',
        sandbox: true
      };
      this.user = mockUser;
      return mockUser;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }

  // تنسيق بيانات المستخدم
  formatUserData(piUser, loginMethod) {
    return {
      uid: piUser.uid || piUser.id,
      username: piUser.username || piUser.name,
      walletAddress: piUser.uid || piUser.wallet_address,
      kycStatus: piUser.kycStatus || 'unknown',
      isVerified: piUser.kycStatus === 'passed',
      country: piUser.country || 'TN',
      loginMethod: loginMethod,
      sandbox: this.sandboxMode,
      lastLogin: new Date().toISOString()
    };
  }

  // إنشاء state عشوائي لـ OAuth
  generateState() {
    return 'pi_' + Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
  }

  // الحصول على رابط Pi Sign-In
  getSignInUrl() {
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      response_type: 'code',
      scope: this.oauthConfig.scopes.join(' '),
      state: this.generateState()
    });
    
    localStorage.setItem('pi_oauth_state', params.get('state'));
    return `https://socialchain.app/oauth/authorize?${params.toString()}`;
  }

  async createPayment(paymentData) {
    try {
      if (this.isPiBrowser && window.Pi) {
        const payment = await window.Pi.createPayment(
          {
            amount: paymentData.amount,
            memo: paymentData.memo,
            metadata: {
              ...paymentData.metadata,
              app: 'BIDX',
              version: '1.0.0',
              timestamp: Date.now()
            }
          },
          {
            onReadyForServerApproval: async (paymentId) => {
              await this.callServerApprove(paymentId);
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
              await this.callServerComplete(paymentId, txid);
            },
            onCancel: (paymentId) => {
              console.log('❌ Cancelled:', paymentId);
            },
            onError: (error) => {
              console.error('❌ Error:', error);
            }
          }
        );

        this.payments.push({
          paymentId: payment.identifier,
          amount: paymentData.amount,
          memo: paymentData.memo,
          status: 'pending',
          timestamp: new Date().toISOString(),
          network: this.sandboxMode ? 'pi_testnet' : 'pi_mainnet'
        });

        return {
          success: true,
          paymentId: payment.identifier,
          amount: paymentData.amount,
          status: 'pending',
          onBlockchain: true,
          network: this.sandboxMode ? 'pi_testnet' : 'pi_mainnet'
        };
      }
      
      // محاكاة للاختبار
      const mockPaymentId = 'sandbox_' + Date.now();
      const mockTxid = 'pi_tx_' + Math.random().toString(36).substr(2, 12);

      try {
        await this.callServerApprove(mockPaymentId);
        await this.callServerComplete(mockPaymentId, mockTxid);
      } catch (e) {
        console.log('Server offline, using mock');
      }

      const mockResult = {
        success: true,
        paymentId: mockPaymentId,
        txid: mockTxid,
        amount: paymentData.amount,
        memo: paymentData.memo,
        status: 'completed',
        onBlockchain: true,
        network: 'pi_testnet',
        sandbox: true
      };

      this.payments.push(mockResult);
      return mockResult;
      
    } catch (error) {
      console.error('Payment error:', error);
      return { success: false, error: error.message };
    }
  }

  async callServerApprove(paymentId) {
    try {
      const response = await fetch(`${this.apiUrl}/pi-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });
      return await response.json();
    } catch (error) {
      console.warn('Server approve failed:', error.message);
      return { success: true, mock: true };
    }
  }

  async callServerComplete(paymentId, txid) {
    try {
      const response = await fetch(`${this.apiUrl}/pi-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid })
      });
      return await response.json();
    } catch (error) {
      console.warn('Server complete failed:', error.message);
      return { success: true, mock: true };
    }
  }

  async completePayment(paymentId, txid) {
    if (txid) {
      await this.callServerComplete(paymentId, txid);
    }
  }

  async getBalance() {
    try {
      return { pi: 1000.0, bid: 5000.0 };
    } catch (error) {
      return { pi: 0, bid: 0 };
    }
  }

  getPaymentHistory() {
    return this.payments;
  }

  logout() {
    console.log('👋 Logging out');
    this.user = null;
    this.payments = [];
  }
}

const piNetworkService = new PiNetworkService();
export { piNetworkService };
export default piNetworkService;
