import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bidxToken } from '../services/bidxToken';
import { piDex } from '../services/piDex';
import { FaWallet, FaPaperPlane, FaExchangeAlt, FaPlus, FaCoins, FaChartLine, FaHistory, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const { user, isAuthenticated, balance } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [activeTab, setActiveTab] = useState('wallet');
  const [swapAmount, setSwapAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [tokenInfo] = useState(bidxToken.getTokenInfo());
  const [pools, setPools] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('bidx_wallet');
      if (saved) setWallet(JSON.parse(saved));
      setPools(piDex.getAllPools());
    }
  }, [isAuthenticated]);

  const handleCreateWallet = async () => {
    setCreating(true);
    toast.loading('جارٍ إنشاء المحفظة على Pi Testnet...');
    
    try {
      const newWallet = await bidxToken.createWallet();
      setWallet(newWallet);
      localStorage.setItem('bidx_wallet', JSON.stringify(newWallet));
      toast.success('✅ تم إنشاء المحفظة!');
      addTransaction('إنشاء محفظة', '+1000 BIDX', 'مكافأة ترحيبية');
    } catch (err) {
      toast.error('فشل إنشاء المحفظة');
    }
    setCreating(false);
  };

  const handleSend = async () => {
    if (!sendAmount || !sendTo) {
      toast.error('أدخل المبلغ والعنوان');
      return;
    }

    toast.loading('جارٍ الإرسال...');
    const result = await bidxToken.transfer(wallet.address, sendTo, parseFloat(sendAmount));
    
    if (result.success) {
      setWallet(prev => ({ ...prev, balance: prev.balance - parseFloat(sendAmount) }));
      toast.success('تم الإرسال!');
      addTransaction('إرسال', `-${sendAmount} BIDX`, sendTo);
      setSendAmount(''); setSendTo('');
    } else {
      toast.error(result.error);
    }
  };

  const handleSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast.error('أدخل مبلغاً');
      return;
    }

    toast.loading('جارٍ التبديل على Pi DEX...');
    const result = await piDex.swap('BIDX', 'PI', parseFloat(swapAmount));
    
    if (result.success) {
      toast.success(`✅ تم تبديل ${result.sent} BIDX → ${result.received.toFixed(2)} Pi`);
      addTransaction('تبديل DEX', `${result.sent} BIDX → ${result.received.toFixed(2)} Pi`, `سعر: ${result.price.toFixed(4)}`);
      setSwapAmount('');
    } else {
      toast.error(result.error);
    }
  };

  const addTransaction = (type, amount, detail) => {
    setTransactions(prev => [{
      id: Date.now(),
      type, amount, detail,
      time: new Date().toLocaleString('ar-TN')
    }, ...prev].slice(0, 20));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <FaWallet style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }} />
        <h2>المحفظة</h2>
        <p style={{ color: '#6b7280' }}>سجل دخول للوصول للمحفظة</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
        <FaWallet style={{ fontSize: '64px', color: '#7c3aed', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>إنشاء محفظة BIDX</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          أنشئ محفظتك على Pi Testnet لتحصل على 1000 BIDX مجاناً للتجربة
        </p>
        <button onClick={handleCreateWallet} disabled={creating} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
          {creating ? '⏳ جاري الإنشاء...' : '🪙 إنشاء المحفظة'}
        </button>
        <p style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
          ⚠️ محفظة تجريبية على Pi Testnet
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* بطاقة المحفظة */}
      <div style={{
        background: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
        color: 'white', padding: '28px', borderRadius: '20px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '13px', opacity: 0.8 }}>BIDX Wallet</p>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>{wallet.balance.toLocaleString()} <span style={{ fontSize: '18px' }}>BIDX</span></p>
          </div>
          <div style={{ fontSize: '40px' }}>🪙</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <code style={{ fontSize: '11px', opacity: 0.9, wordBreak: 'break-all', flex: 1 }}>{wallet.address}</code>
          <button onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success('تم النسخ'); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
            <FaCopy />
          </button>
        </div>

        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Pi Testnet • {tokenInfo.totalSupply.toLocaleString()} BIDX Supply
        </div>
      </div>

      {/* التبويبات */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'wallet', label: '💰 محفظة', icon: '💰' },
          { id: 'dex', label: '🔄 DEX', icon: '🔄' },
          { id: 'history', label: '📋 سجل', icon: '📋' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: activeTab === tab.id ? '#7c3aed' : 'var(--bg-secondary)',
            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
            fontWeight: '600', fontSize: '13px'
          }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      {/* محفظة */}
      {activeTab === 'wallet' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>إرسال BIDX</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={sendTo} onChange={(e) => setSendTo(e.target.value)}
              placeholder="عنوان المحفظة (G...)" className="input" />
            <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)}
              placeholder="المبلغ" className="input" />
            <button onClick={handleSend} className="btn btn-primary" style={{ justifyContent: 'center' }}>
              <FaPaperPlane style={{ marginLeft: '6px' }} /> إرسال
            </button>
          </div>
        </div>
      )}

      {/* DEX */}
      {activeTab === 'dex' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>🔄 تبديل BIDX ↔ Pi</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="كمية BIDX" className="input" style={{ flex: 1 }} />
              <button onClick={handleSwap} className="btn btn-primary">تبديل</button>
            </div>
            {pools.length > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px' }}>
                <p>💰 السعر: <strong>{pools[0].price.toFixed(6)} Pi</strong> / BIDX</p>
                <p>📊 APR: <strong style={{ color: '#059669' }}>{pools[0].apr}%</strong></p>
                <p>📈 حجم 24h: <strong>{pools[0].volume24h.toLocaleString()} Pi</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* سجل */}
      {activeTab === 'history' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>سجل المعاملات</h3>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>لا توجد معاملات</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '600' }}>{tx.type}</span>
                  <span style={{ color: tx.amount.startsWith('-') ? '#ef4444' : '#059669' }}>{tx.amount}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{tx.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;
