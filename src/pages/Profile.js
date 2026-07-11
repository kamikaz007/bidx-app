import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, balance, login, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>سجل الدخول للمتابعة</h2>
        <button onClick={login} className="btn-primary">تسجيل الدخول عبر Pi Network</button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>ملفي الشخصي</h1>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
            {user?.username?.charAt(0) || 'م'}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.username || 'مستخدم'}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{user?.walletAddress}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>رصيد Pi</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>{balance.pi.toLocaleString()} 🟣</p>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>رصيد BID</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{balance.bid.toLocaleString()} 💰</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
