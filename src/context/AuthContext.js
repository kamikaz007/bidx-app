import React, { createContext, useState, useContext, useEffect } from 'react';
import { piNetworkService } from '../services/piNetwork';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ pi: 0, bid: 0 });
  const [payments, setPayments] = useState([]);
  const [isSandbox, setIsSandbox] = useState(true);
  const [kycStatus, setKycStatus] = useState('unknown');

  useEffect(() => {
    initPiNetwork();
    
    // تعيين callback للمصادقة
    piNetworkService.onAuth((userData) => {
      console.log('🔐 Callback مصادقة:', userData);
      setKycStatus(userData.kycStatus);
    });
  }, []);

  const initPiNetwork = async () => {
    try {
      setLoading(true);
      const result = await piNetworkService.initialize();
      setIsSandbox(result.mode !== 'pi-browser');
      
      // استعادة الجلسة السابقة
      const savedUser = localStorage.getItem('bidx_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setKycStatus(parsedUser.kycStatus || 'unknown');
        const bal = await piNetworkService.getBalance();
        setBalance(bal);
      }
    } catch (error) {
      console.error('فشل تهيئة Pi Network:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      
      // التحقق من Pi Browser
      if (!window.Pi && !isSandbox) {
        const useSandbox = window.confirm(
          '📱 BIDX يعمل بشكل أفضل على Pi Browser\n\n' +
          'للتجربة الكاملة مع مصادقة KYC:\n' +
          '1. افتح Pi Browser\n' +
          '2. اذهب إلى bidx.app\n\n' +
          'هل تريد الاستمرار بحساب تجريبي؟'
        );
        
        if (!useSandbox) {
          piNetworkService.openInPiBrowser();
          return null;
        }
      }
      
      toast.loading('جارٍ تسجيل الدخول...');
      
      const piUser = await piNetworkService.authenticate();
      
      if (piUser) {
        // التحقق من KYC
        if (piUser.kycStatus !== 'passed') {
          toast('⚠️ حسابك غير موثق KYC. بعض الميزات محدودة.', {
            icon: '⚠️',
            style: { background: '#fef3c7', color: '#92400e' }
          });
        }
        
        setUser(piUser);
        setKycStatus(piUser.kycStatus || 'unknown');
        localStorage.setItem('bidx_user', JSON.stringify(piUser));
        
        const bal = await piNetworkService.getBalance();
        setBalance(bal);
        
        toast.success(`مرحباً ${piUser.username}! 🎉`);
        return piUser;
      }
    } catch (error) {
      console.error('فشل تسجيل الدخول:', error);
      toast.error('فشل تسجيل الدخول');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    piNetworkService.logout();
    setUser(null);
    setBalance({ pi: 0, bid: 0 });
    setPayments([]);
    setKycStatus('unknown');
    localStorage.removeItem('bidx_user');
    toast.success('تم تسجيل الخروج');
  };

  const makePayment = async (amount, memo, metadata = {}) => {
    try {
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return null;
      }

      // التحقق من KYC للدفعات الكبيرة
      if (amount > 100 && kycStatus !== 'passed') {
        toast.error('يجب توثيق حسابك KYC للمدفوعات الكبيرة');
        return null;
      }

      toast.loading('جارٍ إنشاء الدفعة على البلوكشين...');
      
      const payment = await piNetworkService.createPayment({
        amount,
        memo,
        metadata: { ...metadata, userId: user.uid }
      });

      if (payment.success) {
        setPayments(prev => [payment, ...prev]);
        
        if (payment.onBlockchain) {
          toast.success('✅ تم تسجيل المعاملة على البلوكشين!');
        } else {
          toast.success('تم إنشاء الدفعة بنجاح! 💳');
        }
        
        const newBalance = await piNetworkService.getBalance();
        setBalance(newBalance);
      }

      return payment;
    } catch (error) {
      console.error('فشل إنشاء الدفعة:', error);
      toast.error('فشل إنشاء الدفعة');
      return null;
    }
  };

  const refreshBalance = async () => {
    const bal = await piNetworkService.getBalance();
    setBalance(bal);
  };

  const value = {
    user,
    balance,
    loading,
    payments,
    isSandbox,
    kycStatus,
    login,
    logout,
    makePayment,
    refreshBalance,
    isAuthenticated: !!user,
    isKYCVerified: kycStatus === 'passed',
    isPiBrowser: piNetworkService.isPiBrowser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
