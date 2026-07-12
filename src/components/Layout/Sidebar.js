import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaUser, FaGavel, FaGem, FaWallet, FaSignOutAlt, FaChartLine, FaChartPie, FaMoneyBillWave, FaBars, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminAuth } from '../../services/adminAuth';

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isAdmin = adminAuth.isAdmin();

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'الرئيسية', color: '#7c3aed' },
    { path: '/create', icon: <FaPlus />, label: 'مزاد جديد', color: '#059669' },
    { path: '/fractional', icon: <FaChartPie />, label: 'ملكية جزئية', color: '#059669' },
    { path: '/nft-market', icon: <FaGem />, label: 'سوق NFTs', color: '#db2777' },
    { path: '/payment', icon: <FaMoneyBillWave />, label: 'دفع Pi', color: '#8b5cf6' },
    { path: '/security', icon: <FaShieldAlt />, label: 'الحماية', color: '#059669' },
    { path: '/wallet', icon: <FaWallet />, label: 'المحفظة', color: '#d97706' },
    { path: '/my-auctions', icon: <FaGavel />, label: 'مزاداتي', color: '#2563eb' },
    { path: '/dashboard', icon: <FaChartLine />, label: 'الأرباح', color: '#f59e0b' },
    { path: '/profile', icon: <FaUser />, label: 'حسابي', color: '#0891b2' },
  ];

  // إضافة رابط المدير إذا كان مسجلاً
  if (isAdmin) {
    menuItems.push({ 
      path: '/admin', 
      icon: <FaShieldAlt />, 
      label: '🔐 لوحة التحكم', 
      color: '#f59e0b' 
    });
  }

  const mobileItems = menuItems.slice(0, 5);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* القائمة الجانبية للحاسوب */}
      <aside style={{
        position: 'fixed', right: 0, top: '68px',
        height: 'calc(100vh - 68px)', width: '260px',
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-color)',
        zIndex: 50, overflowY: 'auto'
      }}>
        <div style={{ padding: '20px 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: '0 12px', marginBottom: '8px' }}>
            القائمة الرئيسية
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              const isAdminLink = item.path === '/admin';
              
              return (
                <Link key={item.path} to={item.path} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: isActive ? `${item.color}15` : isAdminLink ? '#fef3c7' : 'transparent',
                  color: isActive ? item.color : isAdminLink ? '#f59e0b' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500', fontSize: '14px',
                  transition: 'all 0.2s',
                  border: isAdminLink ? '1px solid #f59e0b30' : 'none'
                }}>
                  <span style={{ fontSize: '18px', color: isAdminLink ? '#f59e0b' : isActive ? item.color : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '12px 16px', marginTop: '20px',
            borderRadius: '12px', border: 'none',
            background: '#fee2e2', color: '#ef4444',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer'
          }}>
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* شريط التنقل السفلي للموبايل */}
      <div className="mobile-nav">
        {mobileItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'active' : ''}
              style={{
                color: isActive ? item.color : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '400'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setShowMobileMenu(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '4px', background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '10px',
            cursor: 'pointer', padding: '4px 8px'
          }}
        >
          <FaBars style={{ fontSize: '20px' }} />
          <span>المزيد</span>
        </button>
      </div>

      {/* قائمة منبثقة للموبايل */}
      {showMobileMenu && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setShowMobileMenu(false)}>
          <div style={{
            background: 'var(--bg-card)', width: '100%',
            maxHeight: '70vh', overflowY: 'auto',
            borderRadius: '20px 20px 0 0', padding: '20px',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px'
            }}>
              <h3 style={{ fontWeight: '700' }}>القائمة الكاملة</h3>
              <button onClick={() => setShowMobileMenu(false)} style={{
                background: 'none', border: 'none', fontSize: '20px',
                cursor: 'pointer', color: 'var(--text-muted)'
              }}>
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {menuItems.map(item => {
                const isActive = location.pathname === item.path;
                const isAdminLink = item.path === '/admin';
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '12px',
                      background: isActive ? `${item.color}15` : isAdminLink ? '#fef3c7' : 'transparent',
                      color: isAdminLink ? '#f59e0b' : 'var(--text-primary)',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '15px', textDecoration: 'none'
                    }}
                  >
                    <span style={{ fontSize: '20px', color: isAdminLink ? '#f59e0b' : item.color }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              
              <button
                onClick={() => { logout(); setShowMobileMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', marginTop: '8px',
                  borderRadius: '12px', border: 'none',
                  background: '#fee2e2', color: '#ef4444',
                  fontWeight: '600', fontSize: '15px', cursor: 'pointer'
                }}
              >
                <FaSignOutAlt /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
