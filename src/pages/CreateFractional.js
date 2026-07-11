import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUpload, FaArrowRight, FaChartPie, FaCoins, FaPercentage, FaMapMarkerAlt } from 'react-icons/fa';
import { fractionalOwnership } from '../services/fractionalOwnership';
import { useAuth } from '../context/AuthContext';

const CreateFractional = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'realestate',
    location: 'تونس',
    totalShares: '1000',
    pricePerShare: '100',
    minimumShares: '1',
    annualYield: '12',
    image: ''
  });

  const categories = [
    { id: 'realestate', name: 'عقار', icon: '🏢' },
    { id: 'commercial', name: 'تجاري', icon: '🏪' },
    { id: 'agriculture', name: 'زراعي', icon: '🌳' },
    { id: 'industrial', name: 'صناعي', icon: '🏭' },
    { id: 'other', name: 'أخرى', icon: '📦' },
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateValuation = () => {
    const shares = parseInt(formData.totalShares) || 0;
    const price = parseInt(formData.pricePerShare) || 0;
    return shares * price;
  };

  const calculateMonthlyIncome = () => {
    const valuation = calculateValuation();
    const yieldPercent = parseFloat(formData.annualYield) || 0;
    return (valuation * yieldPercent / 100) / 12;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!formData.title || !formData.totalShares || !formData.pricePerShare) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const totalShares = parseInt(formData.totalShares);
    if (totalShares < 100) {
      toast.error('الحد الأدنى للأسهم: 100 سهم');
      return;
    }

    const pricePerShare = parseInt(formData.pricePerShare);
    if (pricePerShare < 1) {
      toast.error('سعر السهم يجب أن يكون Pi 1 على الأقل');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('جارٍ إنشاء الأصل على Pi Testnet...');

    try {
      const result = await fractionalOwnership.createFractionalAsset({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        totalShares: totalShares,
        pricePerShare: pricePerShare,
        minimumShares: parseInt(formData.minimumShares) || 1,
        annualYield: parseFloat(formData.annualYield) || 0,
        imageUrl: formData.image
      }, user?.uid);

      if (result.success) {
        toast.success('✅ تم إنشاء الأصل بنجاح على Pi Testnet!', { id: toastId });
        setTimeout(() => navigate('/fractional'), 1500);
      } else {
        toast.error('فشل إنشاء الأصل: ' + result.error, { id: toastId });
      }
    } catch (error) {
      console.error('فشل إنشاء الأصل:', error);
      toast.error('فشل إنشاء الأصل. حاول مرة أخرى.', { id: toastId });
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

  const valuation = calculateValuation();
  const monthlyIncome = calculateMonthlyIncome();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* العنوان */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#d1fae5', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <FaChartPie style={{ color: '#059669' }} />
          </span>
          إدراج أصل جديد للملكية الجزئية
        </h1>
        <p style={{ color: '#6b7280', marginRight: '60px' }}>
          قم بتجزئة أصل إلى أسهم رقمية وطرحها للمستثمرين على Pi Testnet
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* معلومات أساسية */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#059669' }}>
            📋 معلومات الأصل
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>اسم الأصل *</label>
              <input
                type="text" name="title" value={formData.title}
                onChange={handleChange}
                placeholder="مثال: عمارة سكنية في تونس العاصمة"
                style={inputStyle} required
                onFocus={(e) => e.target.style.borderColor = '#059669'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={labelStyle}>وصف الأصل</label>
              <textarea
                name="description" value={formData.description}
                onChange={handleChange} rows="4"
                placeholder="وصف تفصيلي للأصل: الموقع، المساحة، عدد الوحدات، الدخل المتوقع..."
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => e.target.style.borderColor = '#059669'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>الفئة</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>الموقع</label>
                <div style={{ position: 'relative' }}>
                  <FaMapMarkerAlt style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text" name="location" value={formData.location}
                    onChange={handleChange} placeholder="المدينة، الدولة"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* تفاصيل التجزئة */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#d97706' }}>
            💰 تفاصيل التجزئة
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>إجمالي عدد الأسهم *</label>
                <input
                  type="number" name="totalShares" value={formData.totalShares}
                  onChange={handleChange} min="100" step="100"
                  style={inputStyle} required
                  onFocus={(e) => e.target.style.borderColor = '#d97706'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                  الحد الأدنى: 100 سهم
                </span>
              </div>
              <div>
                <label style={labelStyle}>سعر السهم (Pi) *</label>
                <div style={{ position: 'relative' }}>
                  <FaCoins style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="number" name="pricePerShare" value={formData.pricePerShare}
                    onChange={handleChange} min="1" step="10"
                    style={{ ...inputStyle, paddingRight: '40px' }} required
                    onFocus={(e) => e.target.style.borderColor = '#d97706'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>الحد الأدنى للشراء (أسهم)</label>
                <input
                  type="number" name="minimumShares" value={formData.minimumShares}
                  onChange={handleChange} min="1"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#d97706'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={labelStyle}>العائد السنوي المتوقع (%)</label>
                <div style={{ position: 'relative' }}>
                  <FaPercentage style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="number" name="annualYield" value={formData.annualYield}
                    onChange={handleChange} min="0" max="100" step="0.5"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={(e) => e.target.style.borderColor = '#d97706'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ملخص الاستثمار */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px', background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#059669' }}>
            📊 ملخص الاستثمار
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>القيمة الإجمالية</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>
                {valuation.toLocaleString()} Pi
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>الدخل الشهري المتوقع</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#d97706' }}>
                {monthlyIncome.toLocaleString()} Pi
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>عدد المستثمرين المحتمل</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#7c3aed' }}>
                {Math.floor(parseInt(formData.totalShares) / parseInt(formData.minimumShares || 1)).toLocaleString()}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'white', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
            <strong>💰 رسوم المنصة:</strong> 1% من قيمة كل معاملة شراء. 
            <br />
            <strong>⛓️ الشبكة:</strong> Pi Testnet - سيتم تسجيل جميع المعاملات على البلوكشين.
          </div>
        </div>

        {/* رفع صورة */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <label style={labelStyle}>صورة الأصل</label>
          <div style={{
            border: '2px dashed #d1d5db', borderRadius: '16px',
            padding: '40px', textAlign: 'center', color: '#9ca3af',
            cursor: 'pointer', transition: 'all 0.3s',
            background: '#f9fafb'
          }}>
            <FaUpload style={{ fontSize: '32px', marginBottom: '12px' }} />
            <p style={{ fontWeight: '500' }}>اسحب الصورة هنا أو اضغط للرفع</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>PNG, JPG (max 5MB)</p>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, padding: '16px 24px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', border: 'none', borderRadius: '14px',
              fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)'
            }}
          >
            {loading ? '⏳ جارٍ النشر على Pi Testnet...' : '🚀 نشر الأصل على Pi Testnet'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/fractional')}
            style={{
              padding: '16px 24px', border: '2px solid #e5e7eb',
              borderRadius: '14px', background: 'white',
              cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFractional;
