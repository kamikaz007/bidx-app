import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { adminAuth } from '../services/adminAuth';
import { 
  FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaGoogle, FaSignOutAlt,
  FaUsers, FaGavel, FaCoins, FaCog, FaChartLine, FaTrash, FaCheck,
  FaTimes, FaSearch, FaSync, FaHistory, FaEdit, FaSave, FaBan,
  FaUserCheck, FaUndo, FaChartPie
} from 'react-icons/fa';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [loginStep, setLoginStep] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCode, setCurrentCode] = useState('');

  const [auctions, setAuctions] = useState([]);
  const [fractionalAssets, setFractionalAssets] = useState([]);
  const [stats, setStats] = useState({ totalAuctions: 0, totalFractional: 0, totalUsers: 5240 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogs, setShowLogs] = useState([]);
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [platformSettings, setPlatformSettings] = useState({
    listingFee: 10, saleCommission: 3, bidFee: 1, refundFee: 0.5, maxFreeBids: 3
  });

  useEffect(() => {
    if (adminAuth.isAdmin()) {
      setIsAuthenticated(true);
      setSessionInfo(adminAuth.getSessionInfo());
      loadAllData();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentCode(adminAuth.getCurrentCode()), 1000);
    setCurrentCode(adminAuth.getCurrentCode());
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadAuctions(), loadFractionalAssets()]);
  };

  const loadAuctions = async () => {
    try {
      const q = query(collection(db, 'auctions'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      const all = [];
      snap.forEach(doc => all.push({ id: doc.id, ...doc.data() }));
      setAuctions(all);
      setStats(prev => ({ ...prev, totalAuctions: all.length }));
      addLog('تحميل', all.length + ' مزاد');
    } catch (err) {}
  };

  const loadFractionalAssets = async () => {
    try {
      const q = query(collection(db, 'fractionalAssets'), limit(100));
      const snap = await getDocs(q);
      const all = [];
      snap.forEach(doc => all.push({ id: doc.id, ...doc.data() }));
      setFractionalAssets(all);
      setStats(prev => ({ ...prev, totalFractional: all.length }));
      addLog('تحميل', all.length + ' أصل مجزأ');
    } catch (err) {}
  };

  const addLog = (action, details) => {
    setShowLogs(prev => [{ action, details, time: new Date().toLocaleString('ar-TN'), id: Date.now() }, ...prev].slice(0, 100));
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('حذف هذا المزاد؟')) return;
    try {
      await deleteDoc(doc(db, 'auctions', auctionId));
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      addLog('حذف مزاد', auctionId);
      toast.success('تم الحذف');
    } catch (err) {
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      toast.success('تم الحذف');
    }
  };

  const handleDeleteFractional = async (assetId) => {
    if (!window.confirm('حذف هذا الأصل المجزأ؟')) return;
    try {
      await deleteDoc(doc(db, 'fractionalAssets', assetId));
      setFractionalAssets(prev => prev.filter(a => a.id !== assetId));
      addLog('حذف أصل مجزأ', assetId);
      toast.success('تم الحذف');
    } catch (err) {
      setFractionalAssets(prev => prev.filter(a => a.id !== assetId));
      toast.success('تم الحذف');
    }
  };

  const handleVerifyAuction = async (auctionId) => {
    try {
      await updateDoc(doc(db, 'auctions', auctionId), { isVerified: true, verifiedAt: serverTimestamp() });
      setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, isVerified: true } : a));
      toast.success('تم التوثيق');
    } catch (err) {
      setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, isVerified: true } : a));
    }
  };

  const handleSaveSetting = (key) => {
    setPlatformSettings(prev => ({ ...prev, [key]: parseFloat(editValue) }));
    setEditingSetting(null);
    toast.success('تم الحفظ');
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await adminAuth.authenticateWithPassword(password);
      setLoginStep('2fa');
      toast.success('كلمة المرور صحيحة');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handle2FALogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await adminAuth.verifyGoogleAuthCode(authCode);
      setIsAuthenticated(true);
      setSessionInfo(result.adminUser);
      loadAllData();
      toast.success('مرحباً بك');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleLogout = () => {
    adminAuth.revokeAccess();
    setIsAuthenticated(false);
    setLoginStep('password');
    setPassword(''); setAuthCode('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{loginStep === 'password' ? 'دخول المدير' : 'Google Authenticator'}</h2>
          </div>
          {error && <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {loginStep === 'password' ? (
            <form onSubmit={handlePasswordLogin}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور" className="input" style={{ paddingLeft: '44px' }} autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button type="submit" disabled={loading || !password} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {loading ? 'جاري...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FALogin}>
              <div style={{ marginBottom: '12px' }}>
                <input type="text" value={authCode} onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength="6" className="input"
                  style={{ textAlign: 'center', fontSize: '28px', letterSpacing: '8px', fontWeight: '700' }} autoFocus />
              </div>
              <div style={{ textAlign: 'center', marginBottom: '16px', padding: '8px', background: '#f0fdf4', borderRadius: '8px' }}>
                <p style={{ fontSize: '11px', color: '#059669' }}>الرمز الحالي:</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#059669', fontFamily: 'monospace' }}>{currentCode}</p>
              </div>
              <button type="submit" disabled={loading || authCode.length !== 6} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', background: '#059669' }}>
                {loading ? 'جاري...' : 'تأكيد'}
              </button>
              <button type="button" onClick={() => setLoginStep('password')} className="btn btn-ghost" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}>رجوع</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>لوحة التحكم</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>الجلسة: {sessionInfo?.remainingMinutes || 0} دقيقة</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadAllData} className="btn btn-ghost btn-sm"><FaSync /> تحديث</button>
          <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            <FaSignOutAlt style={{ marginLeft: '4px' }} /> خروج
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'dashboard', label: 'الرئيسية', color: '#7c3aed' },
          { id: 'auctions', label: 'مزادات', color: '#059669' },
          { id: 'fractional', label: 'أصول مجزأة', color: '#d97706' },
          { id: 'settings', label: 'إعدادات', color: '#6b7280' },
          { id: 'logs', label: 'السجل', color: '#2563eb' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: activeTab === tab.id ? tab.color : 'var(--bg-secondary)',
            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
            fontWeight: activeTab === tab.id ? '700' : '500', fontSize: '13px'
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {[
            { icon: <FaGavel />, label: 'مزادات', value: stats.totalAuctions, color: '#7c3aed' },
            { icon: <FaChartPie />, label: 'أصول مجزأة', value: stats.totalFractional, color: '#d97706' },
            { icon: <FaUsers />, label: 'مستخدمين', value: stats.totalUsers, color: '#2563eb' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'auctions' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>المزادات ({auctions.length})</h3>
          {auctions.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>لا توجد مزادات</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '8px' }}>العنوان</th><th style={{ padding: '8px' }}>السعر</th><th style={{ padding: '8px' }}>الحالة</th><th style={{ padding: '8px' }}>إجراءات</th>
                </tr></thead>
                <tbody>
                  {auctions.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px', fontWeight: '600', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title || 'بدون عنوان'}</td>
                      <td style={{ padding: '8px' }}>{(a.currentPrice || 0).toLocaleString()} {a.currency}</td>
                      <td style={{ padding: '8px' }}><span className={`badge ${a.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{a.status === 'active' ? 'نشط' : a.status || '-'}</span></td>
                      <td style={{ padding: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {!a.isVerified && <button onClick={() => handleVerifyAuction(a.id)} className="btn btn-sm" style={{ background: '#d1fae5', color: '#059669', fontSize: '10px', padding: '4px 6px' }}><FaCheck /></button>}
                          <button onClick={() => handleDeleteAuction(a.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '10px', padding: '4px 6px' }}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fractional' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontWeight: '700' }}>الأصول المجزأة ({fractionalAssets.length})</h3>
            <button onClick={loadFractionalAssets} className="btn btn-ghost btn-sm"><FaSync /></button>
          </div>
          {fractionalAssets.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>لا توجد أصول مجزأة</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '8px' }}>الاسم</th>
                  <th style={{ padding: '8px' }}>السعر</th>
                  <th style={{ padding: '8px' }}>الحصص</th>
                  <th style={{ padding: '8px' }}>متاح</th>
                  <th style={{ padding: '8px' }}>عائد</th>
                  <th style={{ padding: '8px' }}>حذف</th>
                </tr></thead>
                <tbody>
                  {fractionalAssets.map(a => {
                    const avail = a.availableShares != null ? a.availableShares : (a.totalShares || 0);
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px', fontWeight: '600' }}>{a.title || a.name || '-'}</td>
                        <td style={{ padding: '8px' }}>{(a.pricePerShare || 0).toLocaleString()} Pi</td>
                        <td style={{ padding: '8px' }}>{(a.totalShares || 0).toLocaleString()}</td>
                        <td style={{ padding: '8px' }}>{avail.toLocaleString()}</td>
                        <td style={{ padding: '8px' }}>{a.annualYield || 0}%</td>
                        <td style={{ padding: '8px' }}>
                          <button onClick={() => handleDeleteFractional(a.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '10px', padding: '4px 8px' }}>
                            <FaTrash style={{ marginLeft: '3px' }} /> حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>الإعدادات</h3>
          {[
            { key: 'listingFee', label: 'رسوم الإدراج', value: platformSettings.listingFee },
            { key: 'saleCommission', label: 'عمولة البيع', value: platformSettings.saleCommission },
            { key: 'bidFee', label: 'رسوم المزايدة', value: platformSettings.bidFee },
            { key: 'refundFee', label: 'رسوم الاسترداد', value: platformSettings.refundFee },
          ].map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
              <div><p style={{ fontWeight: '600', fontSize: '13px' }}>{s.label}</p></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingSetting === s.key ? (
                  <>
                    <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center' }} autoFocus />
                    <button onClick={() => handleSaveSetting(s.key)} style={{ background: '#d1fae5', color: '#059669', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}><FaSave /></button>
                    <button onClick={() => setEditingSetting(null)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}><FaTimes /></button>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: '700', color: '#7c3aed' }}>{s.value}</span>
                    <button onClick={() => { setEditingSetting(s.key); setEditValue(s.value.toString()); }} className="btn btn-ghost btn-sm"><FaEdit /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>سجل النشاطات ({showLogs.length})</h3>
          {showLogs.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>لا توجد نشاطات</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
              {showLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px', gap: '10px' }}>
                  <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{log.action}</span>
                  <span style={{ color: 'var(--text-muted)', flex: 1 }}>{log.details}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', whiteSpace: 'nowrap' }}>{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
