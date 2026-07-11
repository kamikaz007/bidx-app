class PiNetworkService {
  constructor() {
    this.user = null;
    this.payments = [];
    this.initialized = false;
    this.isPiBrowser = false;
    this.authCallback = null;
  }

  // تهيئة Pi SDK
  async initialize() {
    try {
      // التحقق من بيئة التشغيل
      this.isPiBrowser = typeof window.Pi !== 'undefined';
      
      if (this.isPiBrowser) {
        console.log('🟣 تم اكتشاف Pi Browser - تهيئة Pi SDK');
        
        await window.Pi.init({
          version: "2.0",
          sandbox: true // نغيره لـ false عند الإطلاق الرسمي
        });
        
        this.initialized = true;
        return { success: true, mode: 'pi-browser' };
      } else {
        // متصفح عادي - نحتاج Pi Wallet Extension أو نحول المستخدم لـ Pi Browser
        console.log('🌐 متصفح عادي - يرجى استخدام Pi Browser للتجربة الكاملة');
        
        // التحقق من وجود Pi Wallet Extension
        if (typeof window.piWallet !== 'undefined') {
          console.log('✅ تم اكتشاف Pi Wallet Extension');
          this.initialized = true;
          return { success: true, mode: 'extension' };
        }
        
        this.initialized = true;
        return { success: true, mode: 'regular-browser' };
      }
    } catch (error) {
      console.error('❌ فشل تهيئة Pi Network:', error);
      this.initialized = true;
      return { success: false, mode: 'error', error: error.message };
    }
  }

  // مصادقة المستخدم - إجبارية
  async authenticate() {
    try {
      // في Pi Browser - مصادقة حقيقية
      if (this.isPiBrowser && window.Pi) {
        console.log('🟣 بدء مصادقة Pi Network...');
        
        const scopes = ['username', 'payments', 'wallet_address'];
        
        const authResult = await window.Pi.authenticate(scopes, {
          onIncompletePaymentFound: (payment) => {
            console.log('💳 دفعة غير مكتملة:', payment);
            this.handleIncompletePayment(payment);
          }
        });

        // التحقق من KYC
        const kycStatus = authResult.user.kycStatus || 'unknown';
        
        if (kycStatus !== 'passed') {
          console.warn('⚠️ المستخدم لم يكمل التحقق KYC');
          // في الإصدار النهائي: نمنع المستخدمين غير الموثقين
          // حالياً: نسمح لهم مع تحذير
        }

        const userData = {
          uid: authResult.user.uid,
          username: authResult.user.username,
          walletAddress: authResult.user.uid,
          kycStatus: kycStatus,
          isVerified: kycStatus === 'passed',
          country: authResult.user.country || 'TN',
          loginMethod: 'pi-browser',
          loginTime: new Date().toISOString()
        };

        this.user = userData;
        console.log('✅ تم تسجيل الدخول:', userData);
        
        // استدعاء callback إذا وجد
        if (this.authCallback) {
          this.authCallback(userData);
        }
        
        return userData;
      }
      
      // في المتصفح العادي - نحتاج Pi Browser
      console.warn('⚠️ يرجى فتح التطبيق في Pi Browser للمصادقة');
      
      // نعطي المستخدم خيار فتح Pi Browser
      const useSandbox = window.confirm(
        'للتجربة الكاملة، يرجى فتح التطبيق في Pi Browser.\n\n' +
        'هل تريد الاستمرار بحساب تجريبي؟'
      );
      
      if (useSandbox) {
        const mockUser = {
          uid: 'sandbox_user_' + Date.now(),
          username: 'مستخدم_تجريبي_' + Math.random().toString(36).substr(2, 5),
          walletAddress: 'G' + Math.random().toString(36).substr(2, 10).toUpperCase(),
          kycStatus: 'passed', // محاكاة KYC
          isVerified: true,
          country: 'TN',
          loginMethod: 'sandbox',
          loginTime: new Date().toISOString()
        };
        this.user = mockUser;
        return mockUser;
      }
      
      throw new Error('المصادقة تتطلب Pi Browser');
      
    } catch (error) {
      console.error('❌ فشل المصادقة:', error);
      
      // محاولة المصادقة بحساب تجريبي كحل أخير
      const fallbackUser = {
        uid: 'fallback_user_' + Date.now(),
        username: 'زائر_' + Math.random().toString(36).substr(2, 5),
        walletAddress: 'G' + Math.random().toString(36).substr(2, 10).toUpperCase(),
        kycStatus: 'unknown',
        isVerified: false,
        country: 'TN',
        loginMethod: 'fallback',
        loginTime: new Date().toISOString()
      };
      this.user = fallbackUser;
      return fallbackUser;
    }
  }

  // إنشاء دفعة وتسجيلها على البلوكشين
  async createPayment(paymentData) {
    try {
      if (this.isPiBrowser && window.Pi) {
        // دفعة حقيقية على شبكة Pi
        console.log('💳 إنشاء دفعة على شبكة Pi:', paymentData);
        
        const payment = await window.Pi.createPayment(
          {
            amount: paymentData.amount,
            memo: paymentData.memo,
            metadata: {
              ...paymentData.metadata,
              app: 'BIDX',
              version: '1.0.0',
              timestamp: Date.now(),
              type: 'auction_transaction'
            }
          },
          {
            onReadyForServerApproval: (paymentId) => {
              console.log('⏳ جاهز للموافقة:', paymentId);
              this.approveOnServer(paymentId);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
              console.log('✅ معاملة مسجلة على البلوكشين:', txid);
              this.completeOnServer(paymentId, txid);
            },
            onCancel: (paymentId) => {
              console.log('❌ تم إلغاء الدفعة:', paymentId);
            },
            onError: (error, payment) => {
              console.error('⚠️ خطأ:', error);
            }
          }
        );

        this.payments.push(payment);
        return {
          success: true,
          paymentId: payment.identifier,
          amount: paymentData.amount,
          status: 'pending',
          onBlockchain: true
        };
      }
      
      // محاكاة للاختبار
      const mockTxId = 'pi_tx_' + Math.random().toString(36).substr(2, 10);
      const mockPayment = {
        identifier: 'payment_' + Date.now(),
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata,
        status: 'completed',
        transaction: {
          txid: mockTxId,
          verified: true,
          timestamp: new Date().toISOString(),
          onBlockchain: true
        }
      };
      
      this.payments.push(mockPayment);
      console.log('💳 دفعة محاكاة (بلوكشين):', mockTxId);
      
      return {
        success: true,
        paymentId: mockPayment.identifier,
        txid: mockTxId,
        status: 'completed',
        onBlockchain: true
      };
      
    } catch (error) {
      console.error('❌ فشل الدفع:', error);
      return { success: false, error: error.message };
    }
  }

  // موافقة الخادم
  async approveOnServer(paymentId) {
    console.log('✅ موافقة الخادم:', paymentId);
    // هنا نرسل للخادم للموافقة
    return true;
  }

  // إكمال المعاملة
  async completeOnServer(paymentId, txid) {
    console.log('🎉 اكتملت المعاملة على البلوكشين:', txid);
    // هنا نحدث قاعدة البيانات
    return true;
  }

  // معالجة الدفعات غير المكتملة
  handleIncompletePayment(payment) {
    console.log('🔄 معالجة دفعة معلقة:', payment);
    return { status: 'completed' };
  }

  // الحصول على الأرصدة
  async getBalance() {
    try {
      if (this.isPiBrowser) {
        // في Pi Browser الحقيقي
        return { pi: 0, bid: 0 }; // سنجلب من الخادم
      }
      // محاكاة للتطوير
      return { pi: 1000.0, bid: 5000.0 };
    } catch (error) {
      return { pi: 0, bid: 0 };
    }
  }

  // التحقق من KYC
  async checkKYC() {
    if (this.user) {
      return this.user.kycStatus === 'passed';
    }
    return false;
  }

  // فتح في Pi Browser
  openInPiBrowser() {
    const url = window.location.href;
    const piUrl = `https://browser.minepi.com/?url=${encodeURIComponent(url)}`;
    window.open(piUrl, '_blank');
  }

  // تسجيل الخروج
  logout() {
    this.user = null;
    this.payments = [];
    console.log('👋 تم تسجيل الخروج');
  }

  // تعيين callback للمصادقة
  onAuth(callback) {
    this.authCallback = callback;
  }
}

const piNetworkService = new PiNetworkService();

export { piNetworkService };
export default piNetworkService;
