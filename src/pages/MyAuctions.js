import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGavel, FaCheck, FaClock, FaPlus } from 'react-icons/fa';

const MyAuctions = () => {
  const [tab, setTab] = useState('active');

  const myAuctions = [
    { id: '1', title: 'شقة في تونس العاصمة', status: 'active', currentPrice: 250000, currency: 'PI', bids: 15, endTime: new Date(Date.now() + 3600000) },
    { id: '2', title: 'سيارة BMW 2023', status: 'ended', currentPrice: 85000, currency: 'BID', bids: 8, winner: 'مستخدم123' },
    { id: '3', title: 'لوحة فنية', status: 'active', currentPrice: 1200, currency: 'PI', bids: 3, endTime: new Date(Date.now() + 7200000) },
  ];

  const filteredAuctions = myAuctions.filter(a => tab === 'all' || a.status === tab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>مزاداتي</h1>
        <Link to="/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> مزاد جديد
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'all', name: 'الكل' },
          { id: 'active', name: 'نشطة' },
          { id: 'ended', name: 'منتهية' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? '#7c3aed' : 'white',
            color: tab === t.id ? 'white' : '#374151',
            fontWeight: tab === t.id ? 'bold' : 'normal'
          }}>{t.name}</button>
        ))}
      </div>

      {filteredAuctions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <FaGavel style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>لا توجد مزادات</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAuctions.map(auction => (
            <Link to={`/auction/${auction.id}`} key={auction.id} className="card" style={{ padding: '20px', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{auction.title}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                    <span>السعر: {auction.currentPrice.toLocaleString()} {auction.currency}</span>
                    <span>المزايدات: {auction.bids}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  {auction.status === 'active' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 'bold' }}>
                      <FaClock /> نشط
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontWeight: 'bold' }}>
                      <FaCheck /> منتهي
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
