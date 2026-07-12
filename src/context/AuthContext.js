import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance] = useState({ pi: 1000, bid: 5000 });
  const [payments, setPayments] = useState([]);

  // تسجيل دخول تجريبي مباشر
  const login = async () => {
    setLoading(true);
    
    // تأخير بسيط للمحاكاة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      uid: 'dev_user_' + Date.now(),
      username: 'مستخدم_تجريبي',
      walletAddress: 'G' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      kycStatus: 'passed',
      isVerified: true,
      loginMethod: 'sandbox'
    };
    
    setUser(mockUser);
    localStorage.setItem('bidx_user', JSON.stringify(mockUser));
    setLoading(false);
    
    toast.success('مرحباً! تم تسجيل الدخول 🎉');
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setPayments([]);
    localStorage.removeItem('bidx_user');
    toast.success('تم تسجيل الخروج');
  };

  const makePayment = async (amount, memo) => {
    const payment = {
      success: true,
      paymentId: 'pay_' + Date.now(),
      txid: 'pi_tx_' + Math.random().toString(36).substr(2, 10),
      amount,
      memo,
      status: 'completed',
      network: 'pi_testnet'
    };
    
    setPayments(prev => [payment, ...prev]);
    toast.success('تم الدفع بنجاح! 💳');
    return payment;
  };

  // استعادة الجلسة عند التحميل
  useEffect(() => {
    const saved = localStorage.getItem('bidx_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      balance,
      loading,
      payments,
      isSandbox: true,
      login,
      logout,
      makePayment,
      isAuthenticated: !!user,
      isPiBrowser: false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
