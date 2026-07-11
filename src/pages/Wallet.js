import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaWallet, FaPaperPlane, FaCopy, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const { user, balance, payments, makePayment, isAuthenticated, isSandbox } = useAuth();
  const [sendAmount, setSendAmount] = useState('');
  const [sendMemo, setSendMemo] = useState('');

  const handleSend = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('أدخل مبلغ صحيح');
      return;
    }

    const payment = await makePayment(
      parseFloat(sendAmount),
      sendMemo || 'تحويل Pi',
      { type: 'send', from: user?.username }
    );

    if (payment) {
      setSendAmount('');
      setSendMemo('');
    }
  };

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast.success('تم نسخ العنوان');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <FaWallet style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }} />
        <h2>سجل الدخول للوصول إلى محفظتك</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        <FaWallet style={{ marginLeft: '8px' }} /> محفظتي
      </h1>

      {/* بطاقة الرصيد */}
      <div style={{
        background: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
        color: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px'
      }}>
        <p style={{ opacity: 0.8, fontSize: '14px' }}>عنوان المحفظة</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <code style={{ fontSize: '12px', opacity: 0.9, wordBreak: 'break-all' }}>
            {user?.walletAddress}
          </code>
          <button onClick={copyAddress} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
            <FaCopy />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>رصيد Pi</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{balance.pi}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>رصيد BID</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{balance.bid}</p>
          </div>
        </div>

        {isSandbox && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
            ⚠️ وضع المحاكاة - الدفع تجريبي فقط
          </div>
        )}
      </div>

      {/* نموذج الإرسال */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          <FaPaperPlane style={{ marginLeft: '8px' }} /> إرسال Pi
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            placeholder="المبلغ"
            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
          />
          <input
            type="text"
            value={sendMemo}
            onChange={(e) => setSendMemo(e.target.value)}
            placeholder="ملاحظة (اختياري)"
            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
          />
          <button onClick={handleSend} className="btn-primary" style={{ padding: '12px' }}>
            إرسال 💸
          </button>
        </div>
      </div>

      {/* سجل المدفوعات */}
      {payments.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>آخر المدفوعات</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payments.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', background: '#f9fafb', borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCheckCircle style={{ color: '#059669' }} />
                  <div>
                    <p style={{ fontWeight: '500' }}>{p.memo || 'دفعة'}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{p.identifier}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 'bold' }}>{p.amount} Pi</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
