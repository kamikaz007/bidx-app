import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUpload, FaTrash, FaImage, FaChartPie } from 'react-icons/fa';
import { fractionalOwnership } from '../services/fractionalOwnership';
import { useAuth } from '../context/AuthContext';

const CreateFractional = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'realestate',
    location: 'تونس', totalShares: '1000', pricePerShare: '100',
    minimumShares: '1', annualYield: '12'
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
    if (!formData.title) { toast.error('أدخل عنوان الأصل'); return; }

    setLoading(true);
    toast.loading('جارٍ رفع الصور وحفظ الأصل...');

    try {
      // تحويل الصور إلى Base64
      let imageBase64 = [];
      if (images.length > 0) {
        imageBase64 = await fractionalOwnership.filesToBase64(images);
      }

      const result = await fractionalOwnership.createFractionalAsset(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          totalShares: parseInt(formData.totalShares),
          pricePerShare: parseInt(formData.pricePerShare),
          minimumShares: parseInt(formData.minimumShares) || 1,
          annualYield: parseFloat(formData.annualYield) || 0,
          totalValuation: parseInt(formData.totalShares) * parseInt(formData.pricePerShare),
          images: imageBase64
        },
        user?.uid,
        images
      );

      if (result.success) {
        toast.success(`✅ تم إنشاء "${formData.title}" مع ${images.length} صورة`);
        setTimeout(() => navigate('/fractional'), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error('فشل إنشاء الأصل');
    } finally {
      setLoading(false);
    }
  };

  const s = { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', outline: 'none', fontSize: '14px', fontFamily: 'Tajawal', background: 'white' };
  const l = { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
        <FaChartPie style={{ color: '#059669', marginLeft: '8px' }} />
        إدراج أصل جديد
      </h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={l}>اسم الأصل *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="مثال: ساعة رولكس Daytona" style={s} required />
          </div>

          <div>
            <label style={l}>الوصف</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="وصف تفصيلي للأصل..." style={{ ...s, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={l}>عدد الأسهم</label>
              <input type="number" name="totalShares" value={formData.totalShares} onChange={handleChange} min="100" style={s} />
            </div>
            <div>
              <label style={l}>سعر السهم (Pi)</label>
              <input type="number" name="pricePerShare" value={formData.pricePerShare} onChange={handleChange} min="1" style={s} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={l}>الحد الأدنى للشراء</label>
              <input type="number" name="minimumShares" value={formData.minimumShares} onChange={handleChange} min="1" style={s} />
            </div>
            <div>
              <label style={l}>العائد السنوي (%)</label>
              <input type="number" name="annualYield" value={formData.annualYield} onChange={handleChange} min="0" max="100" style={s} />
            </div>
          </div>

          <div>
            <label style={l}>الموقع</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} style={s} />
          </div>

          {/* رفع الصور */}
          <div>
            <label style={l}><FaImage style={{ marginLeft: '6px' }} /> صور الأصل ({images.length}/5)</label>
            <label style={{ display: 'block', border: '2px dashed #d1d5db', borderRadius: '14px', padding: '30px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
              <FaUpload style={{ fontSize: '28px', marginBottom: '8px', color: '#9ca3af' }} />
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>اضغط لاختيار صور</p>
            </label>
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '6px', marginTop: '10px' }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', aspectRatio: '1', border: '2px solid #e5e7eb' }}>
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px' }}><FaTrash /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '14px', justifyContent: 'center', fontSize: '15px', background: '#059669' }}>
              {loading ? '⏳ جاري...' : `🚀 نشر الأصل (${images.length} صورة)`}
            </button>
            <button type="button" onClick={() => navigate('/fractional')} style={{ padding: '14px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>إلغاء</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateFractional;
