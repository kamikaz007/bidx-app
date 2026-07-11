import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaChrome, FaMobile, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const Login = () => {
  const { login, loading, isPiBrowser, isSandbox } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
      padding: '20px'
    }}>
      {/* الشعار */}
      <div style={{
        width: '100px', height: '100px',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        borderRadius: '28px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '48px', color: 'white',
        marginBottom: '32px', boxShadow: '0 20px 40px rgba(109, 40, 217, 0.3)'
      }}>
        B
      </div>
      
      <h1 style={{
        fontSize: '48px', fontWeight: '900',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
      }}>
        BIDX
      </h1>
      
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '4px' }}>
        منصة المزادات العالمية على Pi Network
      </p>
      
      <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '40px' }}>
        ترميز وبيع أي أصل - عقارات، سيارات، NFTs
      </p>

      {/* حالة البيئة */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '32px',
        flexWrap: 'wrap', justifyContent: 'center'
      }}>
        {isPiBrowser ? (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#ede9fe', color: '#7c3aed',
            padding: '8px 16px', borderRadius: '20px',
            fontSize: '13px', fontWeight: '600'
          }}>
            <FaMobile /> Pi Browser ✅
          </span>
        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fef3c7', color: '#d97706',
            padding: '8px 16px', borderRadius: '20px',
            fontSize: '13px', fontWeight: '600'
          }}>
            <FaChrome /> متصفح عادي
          </span>
        )}
      </div>

      {/* زر تسجيل الدخول */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          color: 'white', border: 'none',
          padding: '18px 48px', borderRadius: '16px',
          fontSize: '18px', fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(109, 40, 217, 0.3)',
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', gap: '12px',
          opacity: loading ? 0.7 : 1
        }}
      >
        <span style={{ fontSize: '24px' }}>🟣</span>
        {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول عبر Pi Network'}
      </button>

      {/* المميزات */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px', marginTop: '60px', maxWidth: '700px', width: '100%'
      }}>
        {[
          { icon: <FaShieldAlt />, title: 'KYC موثق', desc: 'جميع المستخدمين موثقين' },
          { icon: <FaCheckCircle />, title: 'بلوكشين', desc: 'معاملات مسجلة على Pi' },
          { icon: <FaMobile />, title: 'Pi Browser', desc: 'تجربة كاملة على الهاتف' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px', color: '#7c3aed', marginBottom: '8px'
            }}>
              {item.icon}
            </div>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* تنبيه للمتصفحات العادية */}
      {!isPiBrowser && (
        <div style={{
          marginTop: '32px', padding: '16px 24px',
          background: '#fef3c7', borderRadius: '12px',
          color: '#92400e', fontSize: '13px',
          maxWidth: '500px'
        }}>
          💡 للحصول على أفضل تجربة مع مصادقة KYC وتأكيد المعاملات على البلوكشين،
          ننصح باستخدام <strong>Pi Browser</strong> على هاتفك.
        </div>
      )}
    </div>
  );
};

export default Login;
