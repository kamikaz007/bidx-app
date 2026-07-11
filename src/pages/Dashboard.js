import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCoins, FaFire, FaUsers, FaGavel, FaGem, FaCrown, FaPercentage } from 'react-icons/fa';
import { feesService } from '../services/feesService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalSales: 0,
    totalBids: 0,
    totalBidders: 0,
    proMembers: 0,
    vipMembers: 0,
    totalUsers: 0
  });

  const [revenue, setRevenue] = useState(null);
  const [exampleAuction, setExampleAuction] = useState(null);

  useEffect(() => {
    // في الإصدار الحقيقي، نجلب هذه البيانات من Firebase
    const mockStats = {
      totalListings: 1250,
      totalSales: 890,
      totalBids: 15000,
      totalBidders: 3200,
      proMembers: 45,
      vipMembers: 12,
      totalUsers: 52000
    };
    setStats(mockStats);
    
    const rev = feesService.getRevenueSummary(mockStats);
    setRevenue(rev);

    // مثال لمزاد عقاري
    const example = feesService.estimatePlatformRevenue(
      250000,  // سعر البيع
      'realestate', // الفئة
      25,      // عدد المزايدات
      'featured' // نوع الإدراج
    );
    setExampleAuction(example);
  }, []);

  const membershipPlans = feesService.getMembershipPlans();
  const listingFees = feesService.calculateListingFee;
  const saleCommission = feesService.calculateSaleCommission(1000, 'default');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          💰 لوحة تحكم الأرباح
        </h1>
        <p style={{ color: '#6b7280' }}>نموذج الربح المستدام لمنصة BIDX</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { icon: <FaCoins />, label: 'إجمالي الأرباح', value: revenue ? `${revenue.totalRevenue.toLocaleString()} BID` : '...', color: '#f59e0b', bg: '#fef3c7' },
          { icon: <FaGavel />, label: 'رسوم الإدراج', value: revenue ? `${revenue.listingRevenue.toLocaleString()} BID` : '...', color: '#7c3aed', bg: '#ede9fe' },
          { icon: <FaPercentage />, label: 'عمولات المبيعات', value: revenue ? `${revenue.saleRevenue.toLocaleString()} BID` : '...', color: '#059669', bg: '#d1fae5' },
          { icon: <FaCrown />, label: 'العضويات', value: revenue ? `${revenue.membershipRevenue.toLocaleString()} BID` : '...', color: '#db2777', bg: '#fce7f3' },
        ].map((card, i) => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', background: card.bg,
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: card.color, fontSize: '18px'
              }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* كيف تجني الأرباح */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaChartLine style={{ color: '#7c3aed' }} /> مصادر الدخل
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {[
            {
              icon: '📋', title: 'رسوم الإدراج',
              description: 'يدفع البائع رسماً عند إنشاء المزاد',
              tiers: [
                { name: 'أساسي', price: '10 BID' },
                { name: 'مميز', price: '100 BID' },
                { name: 'بريميوم', price: '500 BID' },
              ],
              color: '#7c3aed'
            },
            {
              icon: '💸', title: 'عمولة البيع',
              description: 'نسبة من سعر البيع النهائي',
              tiers: [
                { name: 'عادي', price: '3%' },
                { name: 'عقارات', price: '2%' },
                { name: 'NFT', price: '5%' },
              ],
              color: '#059669'
            },
            {
              icon: '🔨', title: 'رسوم المزايدة',
              description: 'رسوم صغيرة على كل مزايدة',
              tiers: [
                { name: 'أول 3', price: 'مجاناً' },
                { name: 'بعد ذلك', price: '1 BID' },
                { name: 'حرق', price: '0.5%' },
              ],
              color: '#d97706'
            },
            {
              icon: '⭐', title: 'الإعلانات المميزة',
              description: 'إظهار المزاد في الصفحة الرئيسية',
              tiers: [
                { name: 'يوم واحد', price: '50 BID' },
                { name: 'أسبوع', price: '200 BID' },
                { name: 'شهر', price: '500 BID' },
              ],
              color: '#db2777'
            },
          ].map((source, i) => (
            <div key={i} style={{
              padding: '20px', background: '#f9fafb',
              borderRadius: '12px', border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{source.icon}</div>
              <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', color: source.color }}>
                {source.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{source.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {source.tiers.map((tier, j) => (
                  <div key={j} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '12px', padding: '4px 0',
                    borderBottom: j < source.tiers.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <span style={{ color: '#6b7280' }}>{tier.name}</span>
                    <span style={{ fontWeight: '600', color: source.color }}>{tier.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مثال لحساب الأرباح من مزاد واحد */}
      {exampleAuction && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
            📊 مثال: أرباح من مزاد عقاري واحد
          </h2>
          
          <div style={{
            background: '#f9fafb', padding: '20px', borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <p style={{ marginBottom: '12px', fontWeight: '600' }}>
              🏢 شقة بـ {exampleAuction.salePrice?.toLocaleString()} Pi | 25 مزايدة | إدراج مميز
            </p>
            
            {Object.entries(exampleAuction.breakdown).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #e5e7eb',
                fontSize: '14px'
              }}>
                <span style={{ color: '#4b5563' }}>{key}</span>
                <span style={{ fontWeight: '700', color: key === 'إجمالي الأرباح' ? '#059669' : '#6b7280' }}>
                  {value?.toLocaleString?.() || value} {key === 'تم حرقه' ? 'BID (محروق)' : 'BID'}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            padding: '16px', borderRadius: '12px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#059669', marginBottom: '4px' }}>
              💡 صافي ربح المنصة من هذا المزاد الواحد
            </p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>
              {exampleAuction.totalPlatformRevenue?.toLocaleString()} BID
            </p>
          </div>
        </div>
      )}

      {/* باقات العضوية */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
          <FaCrown style={{ color: '#f59e0b', marginLeft: '8px' }} />
          باقات العضوية
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {Object.entries(membershipPlans).map(([key, plan]) => (
            <div key={key} style={{
              padding: '24px', borderRadius: '16px',
              border: key === 'vip' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
              background: key === 'vip' ? '#fffdf0' : 'white',
              textAlign: 'center',
              position: 'relative'
            }}>
              {key === 'vip' && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white', padding: '4px 16px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '700'
                }}>
                  الأكثر شعبية
                </div>
              )}
              
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                {key === 'basic' ? '🆓' : key === 'pro' ? '⭐' : '👑'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                {plan.name}
              </h3>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed', marginBottom: '16px' }}>
                {plan.price > 0 ? `${plan.price} BID` : 'مجاني'}
                <span style={{ fontSize: '14px', color: '#6b7280' }}>/{key === 'basic' ? 'للأبد' : 'شهرياً'}</span>
              </div>
              <ul style={{ listStyle: 'none', textAlign: 'right', marginBottom: '16px' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{
                    fontSize: '13px', color: '#4b5563',
                    padding: '6px 0', borderBottom: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{ color: '#10b981' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                {key === 'basic' ? 'الحالي' : 'اشترك الآن'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
