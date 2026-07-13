import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaPlus, FaShoppingCart, FaChartPie, FaSync } from 'react-icons/fa';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { fractionalOwnership } from '../services/fractionalOwnership';
import { useAuth } from '../context/AuthContext';

const FractionalMarket = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(null);
  const [buyShares, setBuyShares] = useState('');

  useEffect(() => {
    if (isAuthenticated) loadAssets();
  }, [isAuthenticated]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'fractionalAssets'), limit(100));
      const snap = await getDocs(q);
      const allAssets = [];
      snap.forEach(doc => {
        const d = doc.data();
        allAssets.push({
          id: doc.id,
          title: d.title || d.name || 'بدون عنوان',
          description: d.description || '',
          location: d.location || d.rental || 'غير محدد',
          totalShares: d.totalShares || 1000,
          availableShares: d.availableShares != null ? d.availableShares : (d.totalShares || 0),
          pricePerShare: d.pricePerShare || 100,
          annualYield: d.annualYield || 0,
          images: d.images || [],
          imageUrl: d.imageUrl || (d.images && d.images.length > 0 ? d.images[0] : null),
          status: d.status || 'active',
          numberOfHolders: d.numberOfHolders || 0
        });
      });
      setAssets(allAssets.length > 0 ? allAssets : getDemoAssets());
    } catch (err) {
      setAssets(getDemoAssets());
    }
    setLoading(false);
  };

  const getDemoAssets = () => [
    { id: 'demo1', title: 'عمارة سكنية - تونس', totalShares: 1000, availableShares: 350, pricePerShare: 500, annualYield: 12, location: 'تونس', images: [] },
    { id: 'demo2', title: 'محل تجاري - سوسة', totalShares: 500, availableShares: 320, pricePerShare: 200, annualYield: 18, location: 'سوسة', images: [] },
  ];

  const handleBuy = async (assetId) => {
    if (!buyShares || parseInt(buyShares) <= 0) {
      toast.error('أدخل عدداً صحيحاً');
      return;
    }
    if (assetId.startsWith('demo')) {
      toast.success('تم شراء ' + buyShares + ' حصة (تجريبي)');
      setShowBuy(null); setBuyShares('');
      return;
    }
    toast.loading('جارٍ الشراء...');
    const result = await fractionalOwnership.purchaseShares(assetId, parseInt(buyShares), user?.uid);
    if (result.success) {
      toast.success('تم شراء ' + buyShares + ' حصة');
      setShowBuy(null); setBuyShares('');
      loadAssets();
    } else {
      toast.error(result.error || 'فشل الشراء');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <FaChartPie style={{ fontSize: '64px', color: '#059669', marginBottom: '16px' }} />
        <h2>الملكية الجزئية</h2>
        <button onClick={login} className="btn btn-primary">دخول</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>🏢 الملكية الجزئية</h1>
            <p>{assets.length} أصل</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={loadAssets} className="btn btn-ghost btn-sm" style={{ color: 'white' }}><FaSync /></button>
            <Link to="/create-fractional" className="btn btn-secondary" style={{ background: 'white', color: '#059669' }}><FaPlus /> إدراج</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>⏳</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {assets.map(asset => {
            const available = asset.availableShares != null ? asset.availableShares : (asset.totalShares || 0);
            const sold = (asset.totalShares || 0) - available;
            const soldPercent = asset.totalShares > 0 ? Math.round((sold / asset.totalShares) * 100) : 0;
            const img = asset.imageUrl || (asset.images && asset.images.length > 0 ? asset.images[0] : null);
            
            return (
              <div key={asset.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: img ? 'none' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                  {img ? (
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>🏢</span>
                  )}
                </div>
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '14px' }}>{asset.title}</h3>
                  <p style={{ fontSize: '11px', color: '#6b7280' }}>📍 {asset.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
                    <strong style={{ color: '#059669' }}>{(asset.pricePerShare || 0).toLocaleString()} Pi</strong>
                    <span style={{ color: '#d97706' }}>{asset.annualYield || 0}%</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: soldPercent + '%', background: '#059669', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px', color: '#9ca3af' }}>
                      <span>{soldPercent}%</span><span>{available} حصة</span>
                    </div>
                  </div>
                  {showBuy === asset.id ? (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      <input type="number" value={buyShares} onChange={(e) => setBuyShares(e.target.value)}
                        placeholder="عدد" min="1" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px' }} />
                      <button onClick={() => handleBuy(asset.id)} className="btn btn-primary btn-sm" style={{ background: '#059669', fontSize: '11px' }}>شراء</button>
                      <button onClick={() => setShowBuy(null)} className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowBuy(asset.id)} className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '8px', justifyContent: 'center', background: '#059669', fontSize: '12px' }}>
                      <FaShoppingCart style={{ marginLeft: '4px' }} /> استثمر
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FractionalMarket;
