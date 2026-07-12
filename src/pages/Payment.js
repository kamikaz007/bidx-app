import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const { makePayment, payments, isPiBrowser, isSandbox } = useAuth();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('أدخل مبلغ صحيح');
      return;
    }

    setLoading(true);
    toast.loading('جارٍ إنشاء الدفعة على Pi Network...');

    try {
      const result = await makePayment(
        parseFloat(amount),
        memo || 'دفعة BIDX',
        { type: 'payment', page: 'payment' }
      );

      if (result && result.success) {
        setLastPayment(result);
        toast.success('تم إنشاء الدفعة بنجاح! 🎉');
        setAmount('');
        setMemo('');
      } else {
        toast.error('فشل إنشاء الدفعة');
      }
    } catch (error) {
      toast.error('حدث خطأ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyTxId = () => {
    if (lastPayment?.txid) {
      navigator.clipboard.writeText(lastPayment.txid);
      toast.success('تم نسخ معرف المعاملة');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '36px' }}>🟣</span>
        دفع Pi Network
      </h1>

      {/* بطاقة الدفع */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            المبلغ (Pi)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="input"
              style={{ paddingLeft: '60px', fontSize: '20px', fontWeight: '700' }}
            />
            <span style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)',
              color: '#7c3aed', fontWeight: '700', fontSize: '16px'
            }}>
              Pi
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            ملاحظة (اختياري)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="سبب الدفع..."
            className="input"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '700',
            justifyContent: 'center',
            borderRadius: '16px'
          }}
        >
          {loading ? '⏳ جاري الدفع...' : '🟣 ادفع الآن'}
        </button>

        {isSandbox && (
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#f59e0b' }}>
            ⚠️ وضع المحاكاة - الدفع تجريبي فقط
          </p>
        )}
      </div>

      {/* نتيجة الدفع */}
      {lastPayment && (
        <div className="card" style={{
          padding: '24px',
          background: lastPayment.status === 'completed' ? '#f0fdf4' : '#fef3c7',
          animation: 'slideUp 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {lastPayment.status === 'completed' ? (
              <FaCheckCircle style={{ fontSize: '24px', color: '#10b981' }} />
            ) : (
              <FaTimesCircle style={{ fontSize: '24px', color: '#f59e0b' }} />
            )}
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
              {lastPayment.status === 'completed' ? 'تم الدفع بنجاح!' : 'قيد المعالجة'}
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>المبلغ:</span>
              <span style={{ fontWeight: '700' }}>{lastPayment.amount} Pi</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>معرف الدفعة:</span>
              <code style={{ fontSize: '12px' }}>{lastPayment.paymentId}</code>
            </div>
            {lastPayment.txid && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>معرف البلوكشين:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: '11px' }}>{lastPayment.txid.slice(0, 20)}...</code>
                  <button onClick={copyTxId} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#7c3aed', fontSize: '14px'
                  }}>
                    <FaCopy />
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>الشبكة:</span>
              <span className="badge badge-primary">{lastPayment.network || 'pi_testnet'}</span>
            </div>
          </div>
        </div>
      )}

      {/* آخر المدفوعات */}
      {payments.length > 0 && (
        <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            📋 آخر المدفوعات
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payments.slice(0, 5).map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px', background: 'var(--bg-secondary)',
                borderRadius: '8px', fontSize: '13px'
              }}>
                <span>{p.amount} Pi</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {p.paymentId?.slice(0, 15)}...
                </span>
                <span className="badge badge-success">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
