import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { piNetworkService } from '../services/piNetwork';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setError('لم يتم استلام كود المصادقة');
        setStatus('error');
        return;
      }

      setStatus('exchanging');
      console.log('🔄 Processing OAuth callback...');

      // تبادل الكود مع الخادم
      const user = await piNetworkService.handleOAuthCallback(code, state);

      if (user) {
        setStatus('success');
        
        // حفظ المستخدم في السياق
        localStorage.setItem('bidx_user', JSON.stringify(user));
        
        toast.success(`مرحباً ${user.username}! 🎉`);
        
        // توجيه للصفحة الرئيسية
        setTimeout(() => navigate('/'), 1500);
      } else {
        throw new Error('فشل المصادقة');
      }
    } catch (err) {
      console.error('Callback error:', err);
      setError(err.message);
      setStatus('error');
      
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
      padding: '20px'
    }}>
      {status === 'processing' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            جاري معالجة تسجيل الدخول...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>يرجى الانتظار</p>
        </>
      )}

      {status === 'exchanging' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔑</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            جاري تبادل المفاتيح...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>تأمين الاتصال بـ Pi Network</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>
            تم تسجيل الدخول بنجاح!
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>جارٍ توجيهك للصفحة الرئيسية...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#ef4444' }}>
            فشل تسجيل الدخول
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            العودة لتسجيل الدخول
          </button>
        </>
      )}

      {/* شريط تقدم */}
      <div style={{ marginTop: '32px', width: '200px' }}>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{
            width: status === 'success' ? '100%' : status === 'error' ? '100%' : '60%',
            background: status === 'error' ? '#ef4444' : '#7c3aed',
            transition: 'width 0.5s'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
