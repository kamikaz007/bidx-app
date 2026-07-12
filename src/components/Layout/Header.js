import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUser, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { isAuthenticated, user, login, logout, balance } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="glass" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '68px', borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '100%', padding: '0 24px', maxWidth: '1400px',
        margin: '0 auto', gap: '16px'
      }}>
        {/* الشعار */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '20px',
            fontWeight: 'bold', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
          }}>B</div>
          <span style={{
            fontSize: '22px', fontWeight: '800',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>BIDX</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              {/* الرصيد */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.05)',
                padding: '8px 14px', borderRadius: '24px',
                border: '1px solid var(--border-color)', fontSize: '12px'
              }}>
                <span>🟣 {balance.pi}</span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span>💰 {balance.bid}</span>
              </div>

              {/* المستخدم */}
              <Link to="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 8px', borderRadius: '12px',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  borderRadius: '8px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'م'}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user?.username || 'مستخدم'}
                </span>
              </Link>

              {/* تسجيل خروج */}
              <button
                onClick={logout}
                title="تسجيل الخروج"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#fee2e2', color: '#ef4444',
                  border: 'none', padding: '8px 14px', borderRadius: '10px',
                  cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                }}
              >
                <FaSignOutAlt /> خروج
              </button>
            </>
          ) : (
            <button onClick={login} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              دخول
            </button>
          )}

          {/* زر الوضع الليلي */}
          <button
            onClick={toggleTheme}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', cursor: 'pointer',
              fontSize: '18px', display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
