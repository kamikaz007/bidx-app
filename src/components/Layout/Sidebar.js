import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaUser, FaGavel, FaGem, FaWallet, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'الرئيسية', color: '#7c3aed' },
    { path: '/create', icon: <FaPlus />, label: 'مزاد جديد', color: '#059669' },
    { path: '/nft-market', icon: <FaGem />, label: 'سوق NFTs', color: '#db2777' },
    { path: '/wallet', icon: <FaWallet />, label: 'المحفظة', color: '#d97706' },
    { path: '/my-auctions', icon: <FaGavel />, label: 'مزاداتي', color: '#2563eb' },
    { path: '/dashboard', icon: <FaChartLine />, label: 'لوحة الأرباح', color: '#f59e0b' },
    { path: '/profile', icon: <FaUser />, label: 'الملف الشخصي', color: '#0891b2' },
  ];

  if (!isAuthenticated) return null;

  return (
    <aside style={{
      position: 'fixed',
      right: 0,
      top: '68px',
      height: 'calc(100vh - 68px)',
      width: '260px',
      background: 'white',
      borderLeft: '1px solid #e5e7eb',
      display: 'none',
      zIndex: 50,
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px 12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '8px' }}>
            القائمة الرئيسية
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isActive ? `${item.color}10` : 'transparent',
                    color: isActive ? item.color : '#4b5563',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{
                    fontSize: '18px',
                    color: isActive ? item.color : '#9ca3af'
                  }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '24px',
                      background: item.color,
                      borderRadius: '0 4px 4px 0'
                    }}></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* بطاقة BIDX Pro */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: '16px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(139, 92, 246, 0.3)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💎</div>
            <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '6px' }}>BIDX Pro</h3>
            <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px', lineHeight: '1.6' }}>
              مزايا حصرية مع BID Token. خصم 50% على رسوم المزايدة
            </p>
            <Link to="/dashboard" style={{
              display: 'block', width: '100%', padding: '10px',
              background: 'white', color: '#7c3aed',
              border: 'none', borderRadius: '10px',
              fontWeight: '700', fontSize: '13px',
              cursor: 'pointer', textAlign: 'center'
            }}>
              اعرف المزيد
            </Link>
          </div>
        </div>

        {/* تسجيل الخروج */}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '12px 16px', marginTop: '16px',
            borderRadius: '12px', border: 'none', background: 'transparent',
            color: '#ef4444', fontWeight: '600', fontSize: '14px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <FaSignOutAlt /> تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
