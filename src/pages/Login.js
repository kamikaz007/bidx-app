import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt, FaFlask } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async () => {
    setLoading(true);
    toast.loading('جارٍ تسجيل الدخول...');
    
    try {
      await login();
      // لا نعيد التوجيه - App.js سيتعامل مع إظهار المحتوى تلقائياً
    } catch (error) {
      toast.error('فشل تسجيل الدخول');
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
      
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
        منصة المزادات العالمية
      </p>

      {/* بطاقة الدخول */}
      <div className="card" style={{
        padding: '32px', maxWidth: '420px', width: '100%',
        marginBottom: '20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🟣</div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
          Pi Sign-In
        </h2>
        
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
          تسجيل دخول آمن باستخدام حساب Pi Network
        </p>

        {/* زر Pi Sign-In (سيتم تفعيله بعد Pi Developer) */}
        <button
          disabled
          style={{
            width: '100%',
            background: '#d1d5db',
            color: '#6b7280', border: 'none',
            padding: '16px 32px', borderRadius: '16px',
            fontSize: '16px', fontWeight: '700',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            opacity: 0.6
          }}
        >
          <FaSignInAlt style={{ fontSize: '18px' }} />
          Pi Sign-In (قريباً)
        </button>

        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px' }}>
          يتطلب إكمال إعدادات Pi Developer Portal
        </p>
      </div>

      {/* زر الحساب التجريبي */}
      <button
        onClick={handleDevLogin}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          color: 'white', border: 'none',
          padding: '16px 40px', borderRadius: '16px',
          fontSize: '16px', fontWeight: '700',
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: '0 8px 24px rgba(109, 40, 217, 0.3)',
          opacity: loading ? 0.7 : 1
        }}
      >
        <FaFlask /> {loading ? '⏳ جاري الدخول...' : 'دخول بحساب تجريبي'}
      </button>

      <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
        🧪 وضع التطوير - للاختبار فقط
      </p>
    </div>
  );
};

export default Login;
