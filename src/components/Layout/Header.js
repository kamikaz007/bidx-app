import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
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
        height: '100%', padding: '0 16px', maxWidth: '1400px',
        margin: '0 auto', gap: '8px'
      }}>
        {/* الشعار */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '18px',
            fontWeight: 'bold', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
          }}>B</div>
          <span className="hide-mobile" style={{
            fontSize: '20px', fontWeight: '800',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>BIDX</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              <div className="hide-mobile" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-secondary)',
                padding: '6px 12px', borderRadius: '20px',
                border: '1px solid var(--border-color)', fontSize: '11px'
              }}>
                <span>🟣 {balance.pi}</span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span>💰 {balance.bid}</span>
              </div>

              <span className="hide-mobile" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.username || 'مستخدم'}
              </span>

              <button
                onClick={logout}
                title="تسجيل الخروج"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: '#fee2e2', color: '#ef4444',
                  border: 'none', padding: '8px 12px', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: '600', fontSize: '12px'
                }}
              >
                <FaSignOutAlt />
                <span className="hide-mobile">خروج</span>
              </button>
            </>
          ) : (
            <button onClick={login} className="btn btn-primary btn-sm">
              دخول
            </button>
          )}

          <button
            onClick={toggleTheme}
            style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center',
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
