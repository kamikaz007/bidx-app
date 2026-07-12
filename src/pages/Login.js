import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { piNetworkService } from '../services/piNetwork';
import { FaSignInAlt, FaFlask, FaShieldAlt, FaCheckCircle, FaMobile } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login, loading: authLoading, isPiBrowser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePiSignIn = async () => {
    setLoading(true);
    toast.loading('جارٍ تسجيل الدخول عبر Pi Network...');
    
    try {
      await piNetworkService.signInWithPi();
      // إذا كان OAuth، سيتم توجيه المتصفح تلقائياً
      // إذا كان Pi Browser، سيتم المصادقة مباشرة
    } catch (error) {
      console.error('Pi Sign-In error:', error);
      toast.error('فشل تسجيل الدخول: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      await login();
      navigate('/');
    } catch (error) {
      console.error('Dev login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', textAlign: 'center',
      padding: '20px'
    }}>
      {/* الشعار */}
      <div style={{
        width: '100px', height: '100px',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        borderRadius: '28px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '48px', color: 'white',
        marginBottom: '32px', boxShadow: '0 20px 40px rgba(109, 40, 217, 0.3)'
      }}>B</div>
      
      <h1 style={{
        fontSize: '48px', fontWeight: '900',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
      }}>BIDX</h1>
      
      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        منصة المزادات العالمية
      </p>

      {/* بطاقة Pi Sign-In */}
      <div className="card" style={{
        padding: '32px', maxWidth: '420px', width: '100%',
        marginBottom: '20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🟣</div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
          Pi Sign-In
        </h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
          تسجيل دخول آمن باستخدام حساب Pi Network
        </p>

        {/* زر Pi Sign-In */}
        <button
          onClick={handlePiSignIn}
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            color: 'white', border: 'none',
            padding: '16px 32px', borderRadius: '16px',
            fontSize: '16px', fontWeight: '700',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 8px 24px rgba(109, 40, 217, 0.3)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            opacity: loading ? 0.7 : 1
          }}
        >
          <FaSignInAlt style={{ fontSize: '18px' }} />
          {loading ? '⏳ جاري تسجيل الدخول...' : 'تسجيل الدخول بـ Pi Network'}
        </button>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)'
        }}>
          <span>🔒 KYC</span>
          <span>⛓️ بلوكشين</span>
          <span>📱 Pi Browser</span>
        </div>
      </div>

      {/* زر الحساب التجريبي */}
      <button
        onClick={handleDevLogin}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'transparent', color: 'var(--text-muted)',
          border: '2px solid var(--border-color)',
          padding: '12px 24px', borderRadius: '12px',
          fontSize: '13px', fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer'
        }}
      >
        <FaFlask /> حساب تجريبي للتطوير
      </button>

      {!isPiBrowser && (
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#f59e0b', maxWidth: '400px' }}>
          💡 استخدم Pi Browser على هاتفك لتجربة Pi Sign-In الحقيقية
        </p>
      )}
    </div>
  );
};

export default Login;
