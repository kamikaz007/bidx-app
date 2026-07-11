import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaGavel, FaFire, FaWallet, FaExchangeAlt, 
  FaChartLine, FaUsers, FaCoins, FaStar, FaClock, FaGem, FaSync 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { auctionService } from '../services/auctionService';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { user, balance, login, isAuthenticated, isSandbox, makePayment } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'الكل', icon: '🏠', color: '#7c3aed' },
    { id: 'realestate', name: 'عقارات', icon: '🏢', color: '#059669' },
    { id: 'cars', name: 'سيارات', icon: '🚗', color: '#dc2626' },
    { id: 'electronics', name: 'إلكترونيات', icon: '📱', color: '#2563eb' },
    { id: 'art', name: 'فنون', icon: '🎨', color: '#d97706' },
    { id: 'nft', name: 'NFTs', icon: '💎', color: '#db2777' },
    { id: 'luxury', name: 'فاخرة', icon: '👑', color: '#9333ea' },
  ];

  // بيانات تجريبية احتياطية
  const demoAuctions = [
    { 
      id: 'demo1', 
      title: 'شقة سكنية فاخرة في تونس العاصمة', 
      description: 'شقة 150م² مع إطلالة بحرية رائعة', 
      currentPrice: 250000, 
      startingPrice: 200000,
      currency: 'PI', 
      endTime: new Date(Date.now() + 86400000), 
      totalBids: 15, 
      category: 'realestate',
      seller: 'عقارات تونس',
      verified: true
    },
    { 
      id: 'demo2', 
      title: 'سيارة BMW الفئة الخامسة 2023', 
      description: 'سيارة فاخرة بحالة ممتازة - 5000 كم فقط', 
      currentPrice: 85000, 
      startingPrice: 70000,
      currency: 'BID', 
      endTime: new Date(Date.now() + 43200000), 
      totalBids: 8, 
      category: 'cars',
      seller: 'معارض السيارات',
      verified: true
    },
    { 
      id: 'demo3', 
      title: 'NFT فني نادر - مجموعة تونسية', 
      description: 'عمل فني رقمي من سلسلة محدودة', 
      currentPrice: 500, 
      startingPrice: 100,
      currency: 'PI', 
      endTime: new Date(Date.now() + 7200000), 
      totalBids: 23, 
      category: 'nft',
      seller: 'فنان رقمي',
      verified: true
    },
  ];

  // جلب المزادات من Firebase
  useEffect(() => {
    loadAuctions();
  }, [selectedCategory]);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const data = await auctionService.getActiveAuctions(selectedCategory);
      if (data && data.length > 0) {
        setAuctions(data);
        console.log('✅ تم جلب', data.length, 'مزاد من Firebase');
      } else {
        // استخدام البيانات التجريبية إذا لم توجد مزادات
        setAuctions([]);
        console.log('⚠️ لا توجد مزادات في Firebase، استخدم البيانات التجريبية');
      }
    } catch (error) {
      console.error('❌ فشل جلب المزادات:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = (endTime) => {
    if (!endTime) return 'غير محدد';
    const end = endTime.toDate ? endTime.toDate() : new Date(endTime);
    const diff = end - Date.now();
    if (diff <= 0) return 'انتهى';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)} يوم`;
    if (hours > 0) return `${hours} ساعة`;
    return `${minutes} دقيقة`;
  };

  const getProgressPercent = (auction) => {
    const current = auction.currentPrice || auction.startingPrice;
    const start = auction.startingPrice;
    if (!start || start === 0) return 10;
    return Math.min(100, ((current - start) / start) * 100 + 10);
  };

  const handleTestPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('أدخل مبلغ صحيح');
      return;
    }
    const payment = await makePayment(parseFloat(paymentAmount), 'تجربة دفع من BIDX', { type: 'test' });
    if (payment) {
      setPaymentAmount('');
      setShowPayment(false);
    }
  };

  // دمج المزادات من Firebase مع التجريبية للعرض
  const displayAuctions = auctions.length > 0 ? auctions : (selectedCategory === 'all' ? demoAuctions : demoAuctions.filter(a => a.category === selectedCategory));

  return (
    <div className="animate-fade-in">
      {isAuthenticated ? (
        <>
          {/* البطاقة الرئيسية */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '24px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(76, 29, 149, 0.3)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800' }}>
                      مرحباً {user?.username}!
                    </h1>
                    {isSandbox && (
                      <span style={{
                        background: 'rgba(254, 243, 199, 0.2)',
                        color: '#fbbf24',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        🧪 وضع المحاكاة
                      </span>
                    )}
                  </div>
                  <p style={{ opacity: 0.8, fontSize: '14px' }}>استكشف المزادات وابدأ المزايدة الآن</p>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{balance.pi.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>🟣 Pi</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{balance.bid.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>💰 BID</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                <Link to="/create" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'white', color: '#7c3aed',
                  padding: '10px 20px', borderRadius: '12px',
                  fontWeight: '700', fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <FaPlus /> إنشاء مزاد
                </Link>
                <Link to="/nft-market" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white', padding: '10px 20px',
                  borderRadius: '12px', fontWeight: '700',
                  fontSize: '14px', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <FaGem /> سوق NFTs
                </Link>
                <button onClick={() => setShowPayment(!showPayment)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white', padding: '10px 20px',
                  borderRadius: '12px', fontWeight: '700',
                  fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}>
                  <FaExchangeAlt /> دفع سريع
                </button>
                <button onClick={loadAuctions} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white', padding: '10px 20px',
                  borderRadius: '12px', fontWeight: '700',
                  fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}>
                  <FaSync /> تحديث
                </button>
              </div>

              {showPayment && (
                <div className="animate-slide-up" style={{
                  marginTop: '16px', display: 'flex', gap: '10px',
                  background: 'rgba(255,255,255,0.1)', padding: '16px',
                  borderRadius: '16px', backdropFilter: 'blur(10px)'
                }}>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="المبلغ بـ Pi"
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.15)', color: 'white',
                      outline: 'none', fontWeight: '600', fontSize: '16px'
                    }}
                  />
                  <button onClick={handleTestPayment} style={{
                    padding: '12px 24px', background: 'white', color: '#7c3aed',
                    border: 'none', borderRadius: '12px', fontWeight: '700',
                    cursor: 'pointer', fontSize: '14px'
                  }}>
                    ادفع 💳
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* الفئات */}
          <div style={{
            display: 'flex', gap: '10px', overflowX: 'auto',
            paddingBottom: '16px', marginBottom: '24px'
          }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '24px',
                  border: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
                  background: selectedCategory === cat.id ? cat.color : 'white',
                  color: selectedCategory === cat.id ? 'white' : '#374151',
                  fontWeight: '600', fontSize: '13px',
                  boxShadow: selectedCategory === cat.id ? `0 4px 12px ${cat.color}40` : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* المزادات */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>
              {loading ? '⏳ جاري التحميل...' : `🔥 المزادات النشطة (${displayAuctions.length})`}
            </h2>
            <Link to="/create" className="btn btn-primary btn-sm">
              <FaPlus /> مزاد جديد
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>جارٍ تحميل المزادات...</p>
            </div>
          ) : displayAuctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>لا توجد مزادات</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>كن أول من ينشئ مزاداً على BIDX!</p>
              <Link to="/create" className="btn btn-primary">
                <FaPlus /> إنشاء مزاد جديد
              </Link>
            </div>
          ) : (
            <div className="auction-grid">
              {displayAuctions.map(auction => {
                const cat = categories.find(c => c.id === auction.category) || { color: '#7c3aed', icon: '📦' };
                const isEnding = auction.endTime ? (auction.endTime.toDate ? auction.endTime.toDate() - Date.now() : new Date(auction.endTime) - Date.now()) < 3600000 : false;
                
                return (
                  <Link to={`/auction/${auction.id}`} key={auction.id} 
                    className="card" style={{ overflow: 'hidden', display: 'block' }}
                  >
                    <div style={{
                      height: '220px',
                      background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '64px', position: 'relative'
                    }}>
                      <span style={{ fontSize: '80px' }}>{cat.icon}</span>
                      
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                        <span className="badge" style={{
                          background: 'rgba(0,0,0,0.6)', color: 'white',
                          backdropFilter: 'blur(10px)', fontSize: '11px'
                        }}>
                          {auction.currency}
                        </span>
                        {auction.isVerified && (
                          <span className="badge" style={{
                            background: 'rgba(16, 185, 129, 0.8)', color: 'white', fontSize: '11px'
                          }}>
                            ✓ موثق
                          </span>
                        )}
                      </div>

                      <div style={{
                        position: 'absolute', bottom: '12px', right: '12px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: isEnding ? '#fef2f2' : 'rgba(0,0,0,0.7)',
                        color: isEnding ? '#ef4444' : '#fbbf24',
                        padding: '6px 10px', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700'
                      }}>
                        <FaClock /> {getRemainingTime(auction.endTime)}
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          {auction.location || 'تونس'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          {auction.totalBids || 0} مزايدة
                        </span>
                      </div>
                      
                      <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px', lineHeight: '1.4' }}>
                        {auction.title}
                      </h3>

                      <div className="progress-bar" style={{ marginBottom: '12px' }}>
                        <div className="progress-bar-fill" style={{ width: `${getProgressPercent(auction)}%` }}></div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>السعر الحالي</div>
                          <div style={{ fontSize: '22px', fontWeight: '800', color: cat.color }}>
                            {auction.currentPrice.toLocaleString()}
                            <span style={{ fontSize: '13px', fontWeight: '500', marginRight: '4px' }}>
                              {auction.currency}
                            </span>
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ borderRadius: '20px' }}>
                          <FaGavel style={{ fontSize: '12px' }} /> مزايدة
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100px', height: '100px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '28px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '48px', color: 'white',
            marginBottom: '32px', boxShadow: '0 20px 40px rgba(109, 40, 217, 0.3)'
          }}>
            B
          </div>
          <h1 className="text-gradient" style={{ fontSize: '48px', fontWeight: '900', marginBottom: '16px' }}>
            BIDX
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            منصة المزادات العالمية على شبكة Pi Network
          </p>
          <button onClick={login} style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            color: 'white', border: 'none', padding: '16px 40px',
            borderRadius: '16px', fontSize: '18px', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(109, 40, 217, 0.3)'
          }}>
            🚀 ابدأ الآن مع Pi Network
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
