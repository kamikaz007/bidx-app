import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUpload, FaArrowRight } from 'react-icons/fa';
import { auctionService } from '../services/auctionService';
import { useAuth } from '../context/AuthContext';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'realestate',
    startingPrice: '',
    minBidIncrement: '100',
    currency: 'PI',
    endTime: '',
    location: 'تونس',
    assetType: 'physical'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!formData.title || !formData.startingPrice || !formData.endTime) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('جارٍ إنشاء المزاد...');

    try {
      const auctionData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startingPrice: parseFloat(formData.startingPrice),
        minBidIncrement: parseFloat(formData.minBidIncrement),
        currency: formData.currency,
        endTime: new Date(formData.endTime),
        location: formData.location,
        assetType: formData.assetType,
        images: [],
        sellerName: user?.username || 'مستخدم'
      };

      const result = await auctionService.createAuction(auctionData, user?.uid || 'anonymous');
      
      if (result.success) {
        toast.success('تم إنشاء المزاد بنجاح! 🎉', { id: toastId });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error('فشل إنشاء المزاد:', error);
      toast.error('فشل إنشاء المزاد. حاول مرة أخرى.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '2px solid #e5e7eb', borderRadius: '12px',
    outline: 'none', fontSize: '14px', fontFamily: 'Tajawal',
    transition: 'all 0.3s', background: 'white'
  };

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: '600',
    marginBottom: '8px', color: '#374151'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          🚀 إنشاء مزاد جديد
        </h1>
        <p style={{ color: '#6b7280' }}>املأ التفاصيل أدناه لبدء المزاد الخاص بك</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* العنوان */}
          <div>
            <label style={labelStyle}>عنوان المزاد *</label>
            <input
              type="text" name="title" value={formData.title}
              onChange={handleChange} placeholder="مثال: شقة فاخرة في قلب تونس العاصمة"
              style={inputStyle} required
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* الوصف */}
          <div>
            <label style={labelStyle}>الوصف</label>
            <textarea
              name="description" value={formData.description}
              onChange={handleChange} rows="4"
              placeholder="أوصف العنصر الذي تريد بيعه بالتفصيل..."
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* الفئة ونوع الأصل */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>الفئة</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                <option value="realestate">🏢 عقارات</option>
                <option value="cars">🚗 سيارات</option>
                <option value="electronics">📱 إلكترونيات</option>
                <option value="art">🎨 فنون</option>
                <option value="nft">💎 NFTs</option>
                <option value="luxury">👑 سلع فاخرة</option>
                <option value="other">📦 أخرى</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>نوع الأصل</label>
              <select name="assetType" value={formData.assetType} onChange={handleChange} style={inputStyle}>
                <option value="physical">أصل فيزيائي</option>
                <option value="nft">NFT رقمي</option>
              </select>
            </div>
          </div>

          {/* السعر والعملة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>سعر البداية *</label>
              <input
                type="number" name="startingPrice" value={formData.startingPrice}
                onChange={handleChange} placeholder="0" min="1"
                style={inputStyle} required
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={labelStyle}>العملة</label>
              <select name="currency" value={formData.currency} onChange={handleChange} style={inputStyle}>
                <option value="PI">🟣 Pi</option>
                <option value="BID">💰 BID</option>
              </select>
            </div>
          </div>

          {/* الحد الأدنى للمزايدة */}
          <div>
            <label style={labelStyle}>الحد الأدنى للمزايدة</label>
            <input
              type="number" name="minBidIncrement" value={formData.minBidIncrement}
              onChange={handleChange} min="1" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* وقت الانتهاء */}
          <div>
            <label style={labelStyle}>وقت الانتهاء *</label>
            <input
              type="datetime-local" name="endTime" value={formData.endTime}
              onChange={handleChange} style={inputStyle} required
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* الموقع */}
          <div>
            <label style={labelStyle}>الموقع</label>
            <input
              type="text" name="location" value={formData.location}
              onChange={handleChange} placeholder="المدينة، الدولة"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* رفع الصور */}
          <div>
            <label style={labelStyle}>الصور</label>
            <div style={{
              border: '2px dashed #d1d5db', borderRadius: '16px',
              padding: '40px', textAlign: 'center', color: '#9ca3af',
              cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <FaUpload style={{ fontSize: '32px', marginBottom: '12px' }} />
              <p style={{ fontWeight: '500' }}>اسحب الصور هنا أو اضغط للرفع</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>PNG, JPG, GIF (max 5MB)</p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '14px 24px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
              }}
            >
              {loading ? '⏳ جارٍ الإنشاء...' : '🚀 إنشاء المزاد'}
            </button>
            <button
              type="button" onClick={() => navigate('/')}
              style={{
                padding: '14px 24px', border: '2px solid #e5e7eb',
                borderRadius: '12px', background: 'white',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px'
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
