import React, { useState, useEffect } from 'react';
import { auctionSecurity } from '../services/auctionSecurity';
import { refundService } from '../services/refundService';
import { FaShieldAlt, FaClock, FaCoins, FaUndo, FaCheckCircle } from 'react-icons/fa';

const AuctionSecurity = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({
    protectedAuctions: 0,
    totalRefunded: 0,
    activeExtensions: 0,
    averageFee: '0.5%'
  });

  useEffect(() => {
    // محاكاة بيانات للعرض
    setStats({
      protectedAuctions: 1250,
      totalRefunded: 45230.75,
      activeExtensions: 12,
      averageFee: '0.5%'
    });

    setRefunds([
      { id: 'ref_1', user: 'مستخدم_1', amount: 1500, fee: 7.5, net: 1492.5, status: 'completed', time: 'منذ 5 دقائق' },
      { id: 'ref_2', user: 'مستخدم_2', amount: 3200, fee: 16, net: 3184, status: 'completed', time: 'منذ 12 دقيقة' },
      { id: 'ref_3', user: 'مستخدم_3', amount: 850, fee: 4.25, net: 845.75, status: 'processing', time: 'الآن' },
    ]);
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaShieldAlt style={{ color: '#059669' }} />
          نظام الحماية والاسترداد
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          حماية من Front-running | استرداد تلقائي | رسوم منخفضة 0.5%
        </p>
      </div>

      {/* إحصائيات الحماية */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {[
          { icon: <FaShieldAlt />, label: 'مزادات محمية', value: stats.protectedAuctions, color: '#059669', bg: '#d1fae5' },
          { icon: <FaCoins />, label: 'إجمالي المسترد', value: stats.totalRefunded.toLocaleString() + ' Pi', color: '#7c3aed', bg: '#ede9fe' },
          { icon: <FaClock />, label: 'تمديدات نشطة', value: stats.activeExtensions, color: '#d97706', bg: '#fef3c7' },
          { icon: <FaUndo />, label: 'متوسط الرسوم', value: stats.averageFee, color: '#db2777', bg: '#fce7f3' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', background: stat.bg,
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: stat.color, fontSize: '18px'
              }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* آلية الحماية */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#059669' }}>
          🛡️ كيف تحميك BIDX من التلاعب؟
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            {
              title: '⏰ تمديد الوقت السري',
              desc: 'عند المزايدة في آخر 30 ثانية، يمتد المزاد تلقائياً دقيقتين إضافيتين. هذا يمنع "القنص" ويعطي الجميع فرصة عادلة.',
              color: '#059669'
            },
            {
              title: '🔐 نظام Commit-Reveal',
              desc: 'قيمة المزايدة مخفية حتى انتهاء وقت الإفصاح. لا أحد يعرف قيمة المزايدات الأخرى.',
              color: '#7c3aed'
            },
            {
              title: '💰 استرداد تلقائي فوري',
              desc: 'المزايدات الخاسرة تسترد تلقائياً خلال 5 دقائق. رسوم 0.5% فقط تغطي تكاليف الشبكة.',
              color: '#d97706'
            },
            {
              title: '🔒 تجميد المبلغ (Escrow)',
              desc: 'جميع المزايدات مجمدة في عقد ذكي حتى انتهاء المزاد. لا يمكن لأحد سحبها قبل انتهاء المزاد.',
              color: '#db2777'
            },
            {
              title: '📊 شفافية كاملة',
              desc: 'جميع المعاملات مسجلة على البلوكشين. يمكنك التحقق من كل شيء في أي وقت.',
              color: '#2563eb'
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '16px', background: 'var(--bg-secondary)',
              borderRadius: '12px', borderRight: `4px solid ${item.color}`
            }}>
              <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* آخر الاستردادات */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
          <FaUndo style={{ color: '#7c3aed', marginLeft: '8px' }} />
          آخر عمليات الاسترداد
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>المستخدم</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>المبلغ</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الرسوم</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الصافي</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الوقت</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((ref, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{ref.user}</td>
                  <td style={{ padding: '12px' }}>{ref.amount} Pi</td>
                  <td style={{ padding: '12px', color: '#ef4444' }}>-{ref.fee} Pi</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#059669' }}>{ref.net} Pi</td>
                  <td style={{ padding: '12px' }}>
                    {ref.status === 'completed' ? (
                      <span className="badge badge-success"><FaCheckCircle style={{ marginLeft: '4px' }} />مكتمل</span>
                    ) : (
                      <span className="badge badge-warning">⏳ قيد المعالجة</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>{ref.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '16px', padding: '12px', background: '#f0fdf4',
          borderRadius: '8px', fontSize: '13px', color: '#059669',
          textAlign: 'center', fontWeight: '600'
        }}>
          💡 متوسط وقت الاسترداد: أقل من 5 دقائق | رسوم ثابتة: 0.5%
        </div>
      </div>
    </div>
  );
};

export default AuctionSecurity;
