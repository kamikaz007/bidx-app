import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const TestUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setResult('⏳ جاري تحويل الصورة...');

    try {
      // تحويل الصورة إلى Base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64 = e.target.result;
        setResult(prev => prev + '\n✅ تم التحويل إلى Base64');
        setResult(prev => prev + '\n📤 جاري الحفظ في Firestore...');
        
        try {
          // حفظ في Firestore
          const docRef = await addDoc(collection(db, 'test_images'), {
            name: file.name,
            size: file.size,
            type: file.type,
            image: base64,
            createdAt: new Date().toISOString()
          });
          
          setResult(prev => prev + '\n✅ تم الحفظ بنجاح!');
          setResult(prev => prev + '\n📝 ID: ' + docRef.id);
          setResult(prev => prev + '\n🖼️ الصورة محفوظة في قاعدة البيانات');
        } catch (err) {
          setError('فشل الحفظ: ' + err.message);
          setResult(prev => prev + '\n❌ ' + err.message);
        }
        
        setUploading(false);
      };
      
      reader.onerror = () => {
        setError('فشل قراءة الملف');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>🧪 اختبار رفع الصور إلى Firestore</h2>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => {
          const f = e.target.files[0];
          if (f) {
            setFile(f);
            setResult('');
            setError('');
            const r = new FileReader();
            r.onload = (ev) => setPreview(ev.target.result);
            r.readAsDataURL(f);
          }
        }}
        style={{ display: 'block', margin: '0 auto 16px' }} 
      />
      
      {preview && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={uploading || !file}
        className="btn btn-primary" 
        style={{ width: '100%', padding: '14px' }}
      >
        {uploading ? '⏳ جاري...' : '📤 حفظ في Firestore'}
      </button>
      
      {result && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#1f2937', borderRadius: '8px', color: '#10b981', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {result}
        </div>
      )}
      
      {preview && result.includes('✅ تم الحفظ') && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#059669', fontWeight: '700' }}>✅ تم حفظ الصورة في Firestore بنجاح!</p>
          <img src={preview} alt="" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default TestUpload;
