import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaClock, FaUser, FaGavel, FaArrowLeft, FaMapMarkerAlt, FaTag, FaCoins } from 'react-icons/fa';
import { auctionService } from '../services/auctionService';
import { useAuth } from '../context/AuthContext';

const AuctionDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  // الفئات للعرض
  const categories = {
    realestate: { icon: '🏢', name: 'عقارات', color: '#059669' },
    cars: { icon: '🚗', name: 'سيارات', color: '#dc2626' },
    electronics: { icon: '📱', name: 'إلكترونيات', color: '#2563eb' },
    art: { icon: '🎨', name: 'فنون', color: '#d97706' },
    nft: { icon: '💎', name: 'NFTs', color: '#db2777' },
    luxury: { icon: '👑', name: 'فاخرة', color: '#9333ea' },
    other: { icon: '📦', name: 'أخرى', color: '#7c3aed' }
  };

  useEffect(() => {
    loadAuction();
  }, [id]);

  const loadAuction = async () => {
    setLoading(true);
    try {
      // جلب المزاد من Firebase
      const data = await auctionService.getAuction(id);
      
      if (data) {
        console.log('✅ تم جلب المزاد:', data);
        setAuction(data);
        
        // جلب المزايدات
        const bidsData = await auctionService.getAuctionBids(id);
        setBids(bidsData);
        
        // التحقق من انتهاء المزاد
        const endTime = data.endTime instanceof Date ? data.endTime : data.endTime?.toDate?.() || new Date(data.endTime);
        if (endTime <= new Date()) {
          setIsEnded(true);
        }
      } else {
        console.log('❌ المزاد غير موجود');
        toast.error('المزاد غير موجود');
      }
    } catch (error) {
      console.error('❌ فشل جلب المزاد:', error);
      toast.error('فشل جلب بيانات المزاد');
    } finally {
      setLoading(false);
    }
  };

  // عداد الوقت
  useEffect(() => {
    if (!auction?.endTime) return;
    
    const timer = setInterval(() => {
      const endTime = auction.endTime instanceof Date ? auction.endTime : auction.endTime?.toDate?.() || new Date(auction.endTime);
      const diff = endTime - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('انتهى المزاد');
        setIsEnded(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        if (days > 0) {
          setTimeLeft(`${days} يوم ${hours}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`);
        } else {
          setTimeLeft(`${hours}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [auction]);

  const handleBid = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول للمزايدة');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= (auction.currentPrice || auction.startingPrice)) {
      toast.error(`المزايدة يجب أن تكون أعلى من ${(auction.currentPrice || auction.startingPrice).toLocaleString()} ${auction.currency}`);
      return;
    }

    try {
      await auctionService.placeBid(id, user?.uid, amount);
      toast.success('تم تقديم مزايدتك بنجاح! 🎉');
      setBidAmount('');
      loadAuction(); // إعادة تحميل المزاد لعرض المزايدة الجديدة
    } catch (error) {
      toast.error('فشل تقديم المزايدة');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>جارٍ تحميل المزاد...</h2>
      </div>
    );
  }

  if (!auction) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>المزاد غير موجود</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>ربما تم حذفه أو انتهت صلاحيته</p>
        <Link to="/" className="btn btn-primary">
          <FaArrowLeft style={{ marginLeft: '8px' }} /> العودة للرئيسية
        </Link>
      </div>
    );
  }

  const cat = categories[auction.category] || categories.other;
  const endTime = auction.endTime instanceof Date ? auction.endTime : auction.endTime?.toDate?.() || new Date(auction.endTime);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* زر الرجوع */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: '#6b7280', marginBottom: '20px', fontWeight: '500',
        fontSize: '14px'
      }}>
        <FaArrowLeft /> العودة للمزادات
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* صورة المزاد */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            height: '450px',
            background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '100px', position: 'relative'
          }}>
            <span>{cat.icon}</span>
            
            {/* وسوم */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
              <span className="badge" style={{
                background: 'rgba(0,0,0,0.6)', color: 'white',
                backdropFilter: 'blur(10px)', fontSize: '12px', padding: '6px 12px'
              }}>
                {auction.currency}
              </span>
              {auction.assetType === 'nft' && (
                <span className="badge" style={{
                  background: 'rgba(219, 39, 119, 0.8)', color: 'white', fontSize: '12px', padding: '6px 12px'
                }}>
                  NFT
                </span>
              )}
            </div>

            {/* حالة المزاد */}
            <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
              {isEnded ? (
                <span className="badge badge-danger" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  ⏰ انتهى المزاد
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  🟢 نشط
                </span>
              )}
            </div>
          </div>
        </div>

        {/* معلومات المزاد */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            {/* الفئة */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: `${cat.color}15`, color: cat.color,
                padding: '6px 12px', borderRadius: '20px',
                fontSize: '13px', fontWeight: '600'
              }}>
                {cat.icon} {cat.name}
              </span>
            </div>

            {/* العنوان */}
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.4' }}>
              {auction.title}
            </h1>

            {/* البائع والموقع */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                <FaUser /> {auction.sellerName || 'بائع'}
              </div>
              {auction.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                  <FaMapMarkerAlt /> {auction.location}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                <FaCoins /> {auction.currency}
              </div>
            </div>

            {/* العد التنازلي */}
            <div style={{
              background: isEnded ? '#fef2f2' : '#f0fdf4',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              border: `2px solid ${isEnded ? '#fecaca' : '#bbf7d0'}`
            }}>
              <div style={{
                fontSize: '13px',
                color: isEnded ? '#dc2626' : '#16a34a',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                <FaClock style={{ display: 'inline', marginLeft: '4px' }} />
                {isEnded ? 'انتهى المزاد' : 'الوقت المتبقي'}
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                color: isEnded ? '#dc2626' : '#16a34a',
                fontFamily: 'monospace'
              }}>
                {timeLeft || '...'}
              </div>
            </div>

            {/* السعر */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>السعر الحالي</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {auction.totalBids || 0} مزايدة
                </span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: cat.color }}>
                {(auction.currentPrice || auction.startingPrice).toLocaleString()}
                <span style={{ fontSize: '18px', fontWeight: '500', marginRight: '8px' }}>
                  {auction.currency}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                السعر المبدئي: {auction.startingPrice?.toLocaleString()} {auction.currency}
              </div>
            </div>

            {/* نموذج المزايدة */}
            {!isEnded && isAuthenticated && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`أدخل مبلغاً أعلى من ${(auction.currentPrice || auction.startingPrice).toLocaleString()}`}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    border: `2px solid ${cat.color}30`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    outline: 'none',
                    background: `${cat.color}05`
                  }}
                  onFocus={(e) => e.target.style.borderColor = cat.color}
                  onBlur={(e) => e.target.style.borderColor = `${cat.color}30`}
                />
                <button
                  onClick={handleBid}
                  className="btn btn-primary"
                  style={{
                    padding: '14px 24px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    fontWeight: '700'
                  }}
                >
                  <FaGavel style={{ marginLeft: '8px' }} />
                  مزايدة
                </button>
              </div>
            )}

            {!isAuthenticated && !isEnded && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                سجل الدخول للمزايدة على هذا المزاد
              </p>
            )}
          </div>
        </div>
      </div>

      {/* الوصف وسجل المزايدات */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* الوصف */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            📝 وصف المزاد
          </h2>
          <div style={{ color: '#4b5563', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {auction.description || 'لا يوجد وصف للمزاد'}
          </div>
          
          {/* معلومات إضافية */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>الفئة</p>
                <p style={{ fontWeight: '600' }}>{cat.icon} {cat.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>نوع الأصل</p>
                <p style={{ fontWeight: '600' }}>
                  {auction.assetType === 'nft' ? '💎 NFT رقمي' : '📦 أصل فيزيائي'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>الموقع</p>
                <p style={{ fontWeight: '600' }}>📍 {auction.location || 'غير محدد'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>الحد الأدنى للزيادة</p>
                <p style={{ fontWeight: '600' }}>{auction.minBidIncrement?.toLocaleString() || '100'} {auction.currency}</p>
              </div>
            </div>
          </div>
        </div>

        {/* سجل المزايدات */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            📊 سجل المزايدات ({bids.length})
          </h2>
          
          {bids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <FaGavel style={{ fontSize: '32px', marginBottom: '8px' }} />
              <p>لا توجد مزايدات بعد. كن أول من يزايد!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {bids.map((bid, index) => (
                <div key={bid.id || index} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  background: index === 0 ? `${cat.color}10` : '#f9fafb',
                  borderRadius: '12px',
                  border: index === 0 ? `2px solid ${cat.color}30` : '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px',
                      background: index === 0 ? cat.color : '#d1d5db',
                      borderRadius: '10px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>
                        {bid.bidderName || 'مزايد'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleString('ar-TN') : 'منذ قليل'}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: cat.color }}>
                    {bid.amount?.toLocaleString()} {auction.currency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
