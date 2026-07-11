import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBell, FaUser, FaPlus, FaGem, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { isAuthenticated, user, login, logout, balance } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();

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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '20px',
            fontWeight: 'bold', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
          }}>B</div>
          <div>
            <span style={{
              fontSize: '22px', fontWeight: '800',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>BIDX</span>
            <span className="badge badge-primary" style={{ fontSize: '9px', marginRight: '4px' }}>BETA</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuthenticated && (
            <>
              {/* رصيد سريع */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.05)',
                padding: '8px 16px', borderRadius: '24px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px' }}>🟣</span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: isDark ? '#c4b5fd' : '#7c3aed' }}>
                    {balance.pi.toLocaleString()}
                  </span>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px' }}>💰</span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: isDark ? '#fcd34d' : '#f59e0b' }}>
                    {balance.bid.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link to="/create" className="btn btn-primary btn-sm" style={{ display: 'none' }}>
                <FaPlus style={{ fontSize: '12px' }} /> مزاد جديد
              </Link>

              <button className="btn btn-ghost btn-sm" style={{ padding: '8px', position: 'relative' }}>
                <FaBell style={{ fontSize: '18px', color: 'var(--text-muted)' }} />
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '8px', height: '8px', background: '#ef4444',
                  borderRadius: '50%', border: '2px solid white'
                }}></span>
              </button>

              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontWeight: 'bold',
                  fontSize: '14px', boxShadow: '0 2px 8px rgba(109, 40, 217, 0.3)'
                }}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'م'}
                </div>
              </Link>
            </>
          )}

          {/* زر الوضع الليلي */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDark ? 'الوضع الفاتح' : 'الوضع الليلي'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            <span style={{ position: 'absolute', right: isDark ? '4px' : '24px', transition: 'all 0.3s', fontSize: '12px' }}>
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>

          {!isAuthenticated && (
            <button onClick={login} className="btn btn-primary">
              <FaUser style={{ fontSize: '14px' }} /> تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
