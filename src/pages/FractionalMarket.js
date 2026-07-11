import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaCoins, FaChartPie, FaUsers, FaBuilding, FaShoppingCart, 
  FaPercentage, FaWallet, FaArrowLeft, FaPlus, FaHandHoldingUsd 
} from 'react-icons/fa';
import { fractionalOwnership } from '../services/fractionalOwnership';
import { useAuth } from '../context/AuthContext';

const FractionalMarket = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [assets, setAssets] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [buyShares, setBuyShares] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAssets();
      loadPortfolio();
    }
  }, [isAuthenticated]);

  const loadAssets = async () => {
    setLoading(true);
    const data = await fractionalOwnership.getAvailableFractionalAssets();
    setAssets(data.length > 0 ? data : getDemoAssets());
    setLoading(false);
  };

  const loadPortfolio = async () => {
    if (user?.uid) {
      const data = await fractionalOwnership.getUserPortfolio(user.uid);
      setPortfolio(data);
    }
  };

  const getDemoAssets = () => [
    {
      id: 'demo1',
      title: 'عمارة سكنية في تونس العاصمة',
      description: 'عمارة 4 طوابق - 8 شقق - دخل شهري 8000 Pi',
      totalShares: 1000,
      availableShares: 650,
      pricePerShare: 500,
      totalValuation: 500000,
      annualYield: 12,
      category: 'realestate',
      image: '🏢',
      location: 'تونس العاصمة',
      numberOfHolders: 28,
      isVerified: true
    },
    {
      id: 'demo2',
      title: 'محل تجاري في سوسة',
      description: 'محل 200م² في موقع استراتيجي',
      totalShares: 500,
      availableShares: 320,
      pricePerShare: 200,
      totalValuation: 100000,
      annualYield: 18,
      category: 'commercial',
      image: '🏪',
      location: 'سوسة',
      numberOfHolders: 15,
      isVerified: true
    },
    {
      id: 'demo3',
      title: 'مزرعة زيتون في صفاقس',
      description: '10 هكتارات - 500 شجرة زيتون - إنتاج سنوي',
      totalShares: 2000,
      availableShares: 1800,
      pricePerShare: 50,
      totalValuation: 100000,
      annualYield: 25,
      category: 'agriculture',
      image: '🌳',
      location: 'صفاقس',
      numberOfHolders: 8,
      isVerified: false
    }
  ];

  const handleBuyShares = async () => {
    if (!selectedAsset || !buyShares) {
      toast.error('أدخل عدد الحصص');
      return;
    }

    const shares = parseInt(buyShares);
    if (shares <= 0 || shares > selectedAsset.availableShares) {
      toast.error(`الحد الأقصى: ${selectedAsset.availableShares} حصة`);
      return;
    }

    const totalCost = shares * selectedAsset.pricePerShare;
    
    if (!window.confirm(
      `تأكيد شراء ${shares} حصة\n` +
      `السعر: ${selectedAsset.pricePerShare} Pi/حصة\n` +
      `الإجمالي: ${totalCost} Pi\n` +
      `العائد السنوي: ${selectedAsset.annualYield}%\n\n` +
      `سيتم تسجيل المعاملة على Pi Testnet`
    )) {
      return;
    }

    toast.loading('جارٍ تنفيذ المعاملة على Pi Testnet...');
    
    const result = await fractionalOwnership.purchaseShares(
      selectedAsset.id,
      shares,
      user?.uid
    );

    if (result.success) {
      toast.success(`✅ تم شراء ${shares} حصة بنجاح!`);
      setShowBuyModal(false);
      setBuyShares('');
      loadAssets();
      loadPortfolio();
    } else {
      toast.error('فشل الشراء: ' + result.error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <FaHandHoldingUsd style={{ fontSize: '64px', color: '#7c3aed', marginBottom: '16px' }} />
        <h2>الملكية الجزئية</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          استثمر في أصول ثمينة بشراء حصص صغيرة
        </p>
        <button onClick={login} className="btn btn-primary">
          سجل دخول للاستثمار
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* العنوان */}
      <div style={{
        background: 'linear-gradient(135deg, #059669, #047857)',
        color: 'white', padding: '32px', borderRadius: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              🏢 الملكية الجزئية
            </h1>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>
              استثمر في عقارات وأصول ثمينة بشراء حصص - مسجلة على Pi Testnet
            </p>
          </div>
          <Link to="/create-fractional" className="btn btn-secondary">
            <FaPlus /> إدراج أصل جديد
          </Link>
        </div>

        {/* إحصائيات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '20px' }}>
          {[
            { icon: <FaBuilding />, label: 'أصول', value: assets.length },
            { icon: <FaUsers />, label: 'مستثمرين', value: '51' },
            { icon: <FaCoins />, label: 'حجم السوق', value: '700K Pi' },
            { icon: <FaPercentage />, label: 'متوسط العائد', value: '18%' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.15)', padding: '12px',
              borderRadius: '12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* الأصول المتاحة */}
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>
        📊 الأصول المتاحة للاستثمار
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>⏳ جاري التحميل...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {assets.map(asset => {
            const soldPercent = ((asset.totalShares - asset.availableShares) / asset.totalShares * 100).toFixed(0);
            
            return (
              <div key={asset.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* صورة */}
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '64px', position: 'relative'
                }}>
                  {asset.image || '🏢'}
                  
                  {/* وسوم */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    {asset.isVerified && (
                      <span className="badge badge-success">✓ موثق</span>
                    )}
                    <span style={{
                      background: 'rgba(0,0,0,0.6)', color: '#fbbf24',
                      padding: '4px 8px', borderRadius: '8px', fontSize: '11px'
                    }}>
                      Pi Testnet
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                    {asset.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
                    📍 {asset.location}
                  </p>

                  {/* شريط التقدم */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>{soldPercent}% مباع</span>
                      <span>{asset.availableShares} حصة متاحة</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${soldPercent}%`, background: '#059669' }}></div>
                    </div>
                  </div>

                  {/* تفاصيل الاستثمار */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>سعر الحصة</span>
                      <p style={{ fontWeight: '700', color: '#059669' }}>{asset.pricePerShare} Pi</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>العائد السنوي</span>
                      <p style={{ fontWeight: '700', color: '#d97706' }}>{asset.annualYield}%</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>التقييم</span>
                      <p style={{ fontWeight: '700' }}>{asset.totalValuation?.toLocaleString()} Pi</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>مستثمرين</span>
                      <p style={{ fontWeight: '700' }}>{asset.numberOfHolders}</p>
                    </div>
                  </div>

                  {/* زر الشراء */}
                  <button
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowBuyModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', background: '#059669' }}
                  >
                    <FaShoppingCart style={{ marginLeft: '8px' }} />
                    استثمر الآن
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة شراء الحصص */}
      {showBuyModal && selectedAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '450px', width: '100%', padding: '24px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              🛒 شراء حصص في {selectedAsset.title}
            </h3>

            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>سعر الحصة:</span>
                <span style={{ fontWeight: '700' }}>{selectedAsset.pricePerShare} Pi</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>متاح:</span>
                <span style={{ fontWeight: '700' }}>{selectedAsset.availableShares} حصة</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>العائد السنوي:</span>
                <span style={{ fontWeight: '700', color: '#059669' }}>{selectedAsset.annualYield}%</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                عدد الحصص
              </label>
              <input
                type="number"
                value={buyShares}
                onChange={(e) => setBuyShares(e.target.value)}
                min="1"
                max={selectedAsset.availableShares}
                placeholder={`الحد الأدنى: ${selectedAsset.minimumShares || 1} حصة`}
                className="input"
              />
            </div>

            {buyShares > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #ede9fe, #fef3c7)',
                padding: '12px', borderRadius: '8px', marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>الإجمالي:</span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#7c3aed' }}>
                    {(buyShares * selectedAsset.pricePerShare).toLocaleString()} Pi
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleBuyShares}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', background: '#059669' }}
              >
                تأكيد الشراء على Pi Testnet
              </button>
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  setBuyShares('');
                }}
                className="btn btn-ghost"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractionalMarket;
