import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGem, FaFire, FaEthereum } from 'react-icons/fa';

const NFTMarket = () => {
  const [filter, setFilter] = useState('all');

  const nfts = [
    { id: 'nft1', name: 'فن رقمي تونسي #001', artist: 'فنان تونسي', price: 500, currency: 'PI', likes: 42, category: 'art' },
    { id: 'nft2', name: 'عقار رمزي - شقة سوسة', artist: 'BIDX', price: 150000, currency: 'PI', likes: 28, category: 'realestate' },
    { id: 'nft3', name: 'تذكرة حفل موسيقي', artist: 'منظم', price: 50, currency: 'BID', likes: 15, category: 'tickets' },
    { id: 'nft4', name: 'سيارة كلاسيكية 1967', artist: 'جامع', price: 75000, currency: 'PI', likes: 89, category: 'cars' },
  ];

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'art', name: 'فن رقمي' },
    { id: 'realestate', name: 'عقارات رمزية' },
    { id: 'tickets', name: 'تذاكر' },
    { id: 'cars', name: 'مركبات' },
  ];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '32px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
        <FaGem style={{ fontSize: '48px', marginBottom: '16px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>سوق NFTs 💎</h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>امتلك أصولاً رقمية فريدة على البلوكشين</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === cat.id ? '#f59e0b' : 'white',
            color: filter === cat.id ? 'white' : '#374151',
            fontWeight: filter === cat.id ? 'bold' : 'normal'
          }}>{cat.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {nfts.filter(n => filter === 'all' || n.category === filter).map(nft => (
          <Link to={`/auction/${nft.id}`} key={nft.id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              height: '250px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '64px', position: 'relative'
            }}>
              💎
              <span style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
              }}>NFT</span>
            </div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>{nft.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>بواسطة {nft.artist}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                  {nft.price.toLocaleString()} {nft.currency}
                </p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '14px' }}>
                  <FaFire /> {nft.likes}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NFTMarket;
