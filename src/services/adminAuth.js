import { generate, verify } from 'otplib';

// سر Google Authenticator - يجب أن يكون 16 حرف على الأقل (Base32)
const OTP_SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'; // 32 حرف

class AdminAuthService {
  constructor() {
    this.config = {
      adminPassword: '53802190kouki',
      otpSecret: OTP_SECRET,
      sessionDuration: 30,
      maxAttempts: 3,
      blockDuration: 15,
    };

    this.state = {
      isAuthenticated: false,
      sessionStart: null,
      attempts: 0,
      blockedUntil: null,
      adminUser: null
    };

    this.restoreSession();
  }

  async authenticateWithPassword(password) {
    if (this.isBlocked()) {
      const remaining = Math.ceil((this.state.blockedUntil - Date.now()) / 60000);
      throw new Error(`⛔ تم حظر الدخول. حاول بعد ${remaining} دقيقة`);
    }

    if (password !== this.config.adminPassword) {
      this.state.attempts++;
      if (this.state.attempts >= this.config.maxAttempts) {
        this.state.blockedUntil = Date.now() + (this.config.blockDuration * 60000);
        throw new Error(`🚫 تم حظر الدخول ${this.config.blockDuration} دقيقة`);
      }
      throw new Error(`❌ كلمة مرور خاطئة. متبقي ${this.config.maxAttempts - this.state.attempts} محاولات`);
    }

    this.state.attempts = 0;
    return { success: true, nextStep: '2fa' };
  }

  async verifyGoogleAuthCode(code) {
    const isValid = verify({ token: code, secret: this.config.otpSecret });
    if (!isValid) throw new Error('❌ رمز التحقق غير صحيح');
    return this.grantAccess();
  }

  getCurrentCode() {
    return generate({ secret: this.config.otpSecret });
  }

  grantAccess() {
    this.state.isAuthenticated = true;
    this.state.sessionStart = Date.now();
    this.state.attempts = 0;
    this.state.adminUser = {
      role: 'super_admin',
      loginTime: new Date().toISOString(),
      sessionExpires: new Date(Date.now() + this.config.sessionDuration * 60000).toISOString()
    };
    this.saveSession();
    return { success: true, sessionDuration: this.config.sessionDuration, adminUser: this.state.adminUser };
  }

  isAdmin() {
    if (!this.state.isAuthenticated) return false;
    if (this.state.sessionStart) {
      const elapsed = (Date.now() - this.state.sessionStart) / 60000;
      if (elapsed > this.config.sessionDuration) { this.revokeAccess(); return false; }
    }
    return true;
  }

  isBlocked() {
    return this.state.blockedUntil && Date.now() < this.state.blockedUntil;
  }

  revokeAccess() {
    this.state.isAuthenticated = false;
    this.state.sessionStart = null;
    this.state.adminUser = null;
    this.clearSession();
  }

  getSessionInfo() {
    if (!this.isAdmin()) return null;
    const remaining = this.state.sessionStart 
      ? Math.ceil(this.config.sessionDuration - ((Date.now() - this.state.sessionStart) / 60000)) : 0;
    return { ...this.state.adminUser, remainingMinutes: remaining, isActive: true };
  }

  saveSession() {
    const data = { isAuthenticated: this.state.isAuthenticated, sessionStart: this.state.sessionStart, adminUser: this.state.adminUser };
    localStorage.setItem('bidx_admin', btoa(JSON.stringify(data)));
  }

  restoreSession() {
    try {
      const encoded = localStorage.getItem('bidx_admin');
      if (encoded) {
        const data = JSON.parse(atob(encoded));
        if (data.sessionStart) {
          const elapsed = (Date.now() - data.sessionStart) / 60000;
          if (elapsed <= this.config.sessionDuration) {
            this.state.isAuthenticated = data.isAuthenticated;
            this.state.sessionStart = data.sessionStart;
            this.state.adminUser = data.adminUser;
          }
        }
      }
    } catch (e) { this.clearSession(); }
  }

  clearSession() { localStorage.removeItem('bidx_admin'); }
}

export const adminAuth = new AdminAuthService();
export default adminAuth;
