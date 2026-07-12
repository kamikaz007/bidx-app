import React, { createContext, useState, useContext, useEffect } from 'react';
import { piNetworkService } from '../services/piNetwork';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ pi: 1000, bid: 5000 });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      await piNetworkService.initialize();
      const savedUser = localStorage.getItem('bidx_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const piUser = await piNetworkService.authenticate();
      
      if (piUser) {
        setUser(piUser);
        localStorage.setItem('bidx_user', JSON.stringify(piUser));
        toast.success(`مرحباً ${piUser.username}! 🎉`);
        return piUser;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('فشل تسجيل الدخول');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    piNetworkService.logout();
    setUser(null);
    setPayments([]);
    localStorage.removeItem('bidx_user');
    toast.success('تم تسجيل الخروج');
  };

  const makePayment = async (amount, memo, metadata = {}) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }

    toast.loading('جارٍ إنشاء الدفعة...');
    
    try {
      const payment = await piNetworkService.createPayment({ amount, memo, metadata });
      
      if (payment.success) {
        setPayments(prev => [payment, ...prev]);
        toast.success('تم الدفع بنجاح! 💳');
        return payment;
      }
    } catch (error) {
      toast.error('فشل الدفع');
    }
    return null;
  };

  const value = {
    user,
    balance,
    loading,
    payments,
    isSandbox: true,
    kycStatus: 'passed',
    login,
    logout,
    makePayment,
    isAuthenticated: !!user,
    isPiBrowser: piNetworkService.isPiBrowser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
