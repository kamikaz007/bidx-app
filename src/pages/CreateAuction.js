import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import { auctionService } from '../services/auctionService';
import { useAuth } from '../context/AuthContext';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'realestate',
    startingPrice: '', minBidIncrement: '100', currency: 'PI',
    endTime: '', location: 'تونس', assetType: 'physical'
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('الحد الأقصى 5 صور');
      return;
    }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} حجمها كبير`);
        return;
      }
      setImages(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    toast.success(`تم إضافة ${files.length} صورة`);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('يجب تسجيل الدخول'); return; }
    if (!formData.title || !formData.startingPrice || !formData.endTime) {
      toast.error('املأ جميع الحقول المطلوبة'); return;
    }

    setLoading(true);
    toast.loading('جارٍ رفع الصور وإنشاء المزاد...');

    try {
      const result = await auctionService.createAuction(
        {
          ...formData,
          startingPrice: parseFloat(formData.startingPrice),
          minBidIncrement: parseFloat(formData.minBidIncrement),
          endTime: new Date(formData.endTime),
          sellerName: user?.username || 'مستخدم'
        },
        user?.uid,
        images
      );

      if (result.success) {
        toast.success(`✅ تم إنشاء المزاد مع ${result.imageCount || images.length} صورة`);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error('فشل إنشاء المزاد');
    } finally {
      setLoading(false);
    }
  };

  const s = { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', outline: 'none', fontSize: '14px', fontFamily: 'Tajawal', background: 'white' };
  const l = { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>🚀 إنشاء مزاد جديد</h1>
      
      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label style={l}>العنوان *</label><input type="text" name="title" value={formData.title} onChange={handleChange} style={s} required /></div>
          <div><label style={l}>الوصف</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ ...s, resize: 'vertical' }} /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={l}>الفئة</label><select name="category" value={formData.category} onChange={handleChange} style={s}><option value="realestate">🏢 عقارات</option><option value="cars">🚗 سيارات</option><option value="electronics">📱 إلكترونيات</option><option value="art">🎨 فنون</option><option value="nft">💎 NFTs</option><option value="luxury">👑 فاخرة</option></select></div>
            <div><label style={l}>نوع الأصل</label><select name="assetType" value={formData.assetType} onChange={handleChange} style={s}><option value="physical">فيزيائي</option><option value="nft">NFT رقمي</option></select></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={l}>سعر البداية *</label><input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} min="1" style={s} required /></div>
            <div><label style={l}>العملة</label><select name="currency" value={formData.currency} onChange={handleChange} style={s}><option value="PI">🟣 Pi</option><option value="BID">💰 BID</option></select></div>
          </div>
          
          <div><label style={l}>وقت الانتهاء *</label><input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} style={s} required /></div>
          <div><label style={l}>الموقع</label><input type="text" name="location" value={formData.location} onChange={handleChange} style={s} /></div>

          {/* رفع الصور */}
          <div>
            <label style={l}><FaImage style={{ marginLeft: '6px' }} /> صور المزاد ({images.length}/5)</label>
            <label style={{ display: 'block', border: '2px dashed #d1d5db', borderRadius: '16px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
              <FaUpload style={{ fontSize: '32px', marginBottom: '12px', color: '#9ca3af' }} />
              <p style={{ color: '#9ca3af' }}>اضغط لاختيار صور</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>JPG, PNG, GIF, WEBP (max 5MB)</p>
            </label>
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: '2px solid #e5e7eb' }}>
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '10px' }}><FaTrash /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '14px', justifyContent: 'center', fontSize: '16px' }}>
              {loading ? '⏳ جاري...' : `🚀 إنشاء المزاد (${images.length} صورة)`}
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '14px 24px', border: '2px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>إلغاء</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
