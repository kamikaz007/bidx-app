import React, { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Debug = () => {
  const { user, isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState('غير معروف');

  const checkFirebase = async () => {
    try {
      setFirebaseStatus('جاري التحقق...');
      const snapshot = await getDocs(collection(db, 'auctions'));
      setFirebaseStatus(`✅ متصل - عدد المزادات: ${snapshot.size}`);
      
      const allAuctions = [];
      snapshot.forEach(doc => {
        allAuctions.push({ id: doc.id, ...doc.data() });
      });
      setAuctions(allAuctions);
      console.log('📊 جميع المزادات:', allAuctions);
    } catch (err) {
      setFirebaseStatus('❌ فشل الاتصال');
      setError(err.message);
      console.error('خطأ Firebase:', err);
    }
  };

  const loadAllAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auctionService.getActiveAuctions('all', 100);
      setAuctions(data);
      console.log('✅ مزادات نشطة:', data);
    } catch (err) {
      setError(err.message);
      console.error('خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirebase();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        🔍 صفحة التشخيص
      </h1>

      {/* حالة المستخدم */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>👤 حالة المستخدم</h3>
        <p>مسجل الدخول: {isAuthenticated ? '✅ نعم' : '❌ لا'}</p>
        {user && <p>معرف المستخدم: {user.uid}</p>}
        {user && <p>اسم المستخدم: {user.username}</p>}
      </div>

      {/* حالة Firebase */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>🔥 حالة Firebase</h3>
        <p>{firebaseStatus}</p>
        {error && <p style={{ color: 'red' }}>خطأ: {error}</p>}
      </div>

      {/* أزرار التحكم */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button onClick={checkFirebase} className="btn btn-primary">
          🔄 تحقق من Firebase
        </button>
        <button onClick={loadAllAuctions} className="btn btn-secondary">
          📋 جلب جميع المزادات
        </button>
      </div>

      {/* عرض المزادات */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          📦 المزادات ({auctions.length})
        </h3>
        
        {loading ? (
          <p>⏳ جاري التحميل...</p>
        ) : auctions.length === 0 ? (
          <p style={{ color: '#6b7280' }}>لا توجد مزادات في قاعدة البيانات</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auctions.map((a, i) => (
              <div key={a.id || i} style={{
                padding: '12px', background: '#f9fafb', borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p><strong>ID:</strong> {a.id}</p>
                <p><strong>العنوان:</strong> {a.title}</p>
                <p><strong>الحالة:</strong> {a.status}</p>
                <p><strong>السعر:</strong> {a.currentPrice} {a.currency}</p>
                <p><strong>الفئة:</strong> {a.category}</p>
                <p><strong>وقت الانتهاء:</strong> {a.endTime?.toDate ? a.endTime.toDate().toString() : String(a.endTime)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Debug;
