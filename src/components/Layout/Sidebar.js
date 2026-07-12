import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaUser, FaGavel, FaGem, FaWallet, FaSignOutAlt, FaChartLine, FaChartPie, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'الرئيسية', color: '#7c3aed' },
    { path: '/create', icon: <FaPlus />, label: 'مزاد جديد', color: '#059669' },
    { path: '/fractional', icon: <FaChartPie />, label: 'الملكية الجزئية', color: '#059669' },
    { path: '/nft-market', icon: <FaGem />, label: 'سوق NFTs', color: '#db2777' },
    { path: '/payment', icon: <FaMoneyBillWave />, label: 'الدفع Pi', color: '#8b5cf6' },
    { path: '/wallet', icon: <FaWallet />, label: 'المحفظة', color: '#d97706' },
    { path: '/my-auctions', icon: <FaGavel />, label: 'مزاداتي', color: '#2563eb' },
    { path: '/dashboard', icon: <FaChartLine />, label: 'لوحة الأرباح', color: '#f59e0b' },
    { path: '/profile', icon: <FaUser />, label: 'الملف الشخصي', color: '#0891b2' },
  ];

  if (!isAuthenticated) return null;

  return (
    <aside style={{
      position: 'fixed', right: 0, top: '68px',
      height: 'calc(100vh - 68px)', width: '260px',
      background: 'var(--bg-sidebar)',
      borderLeft: '1px solid var(--border-color)',
      display: 'none', zIndex: 50, overflowY: 'auto'
    }}>
      <div style={{ padding: '20px 12px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: '0 12px', marginBottom: '8px' }}>
          القائمة الرئيسية
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                background: isActive ? `${item.color}15` : 'transparent',
                color: isActive ? item.color : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500', fontSize: '14px',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '18px', color: isActive ? item.color : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && <div style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '4px', height: '24px', background: item.color, borderRadius: '0 4px 4px 0'
                }}></div>}
              </Link>
            );
          })}
        </div>

        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '12px 16px', marginTop: '16px',
          borderRadius: '12px', border: 'none',
          background: 'transparent', color: '#ef4444',
          fontWeight: '600', fontSize: '14px', cursor: 'pointer'
        }}>
          <FaSignOutAlt /> تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
