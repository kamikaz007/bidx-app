// نظام الرسوم والعمولات في BIDX
// جميع الرسوم محسوبة بعملة BID أو Pi

class FeesService {
  constructor() {
    // إعدادات الرسوم الأساسية
    this.config = {
      // رسوم إنشاء المزاد (تدفع مرة واحدة)
      listingFee: {
        basic: 10,      // مزاد عادي
        featured: 100,  // مزاد مميز (يظهر في الأعلى)
        premium: 500    // مزاد بريميوم (إعلان + توثيق)
      },
      
      // عمولة من سعر البيع النهائي
      saleCommission: {
        default: 3.0,    // 3% للمزادات العادية
        realestate: 2.0, // 2% للعقارات (قيمة عالية)
        nft: 5.0,        // 5% للـ NFTs
        luxury: 4.0      // 4% للسلع الفاخرة
      },
      
      // رسوم المزايدة (تدفع مع كل مزايدة)
      bidFee: {
        enabled: true,
        amount: 1,      // 1 BID لكل مزايدة
        freeForFirst: 3 // أول 3 مزايدات مجانية
      },
      
      // نظام الحرق (يحرق من العملة لتقليل التضخم)
      burnRate: {
        listing: 0.5,   // 0.5% من رسوم الإدراج تحرق
        sale: 1.0,      // 1% من قيمة البيع تحرق
        bid: 0.5        // 0.5% من رسوم المزايدة تحرق
      },
      
      // العضويات المميزة
      membership: {
        basic: { name: 'أساسي', price: 0, features: ['إنشاء 3 مزادات/شهر', 'مزايدة غير محدودة'] },
        pro: { name: 'محترف', price: 100, features: ['إنشاء 20 مزاد/شهر', 'خصم 25% على العمولات', 'إعلان مميز شهري'] },
        vip: { name: 'VIP', price: 500, features: ['مزادات غير محدودة', 'خصم 50% على العمولات', '3 إعلانات مميزة', 'شارة VIP'] }
      },
      
      // خدمات إضافية
      services: {
        verification: 100,  // توثيق الأصول الثمينة
        promotion: 50,      // ترويج المزاد
        urgentSale: 200     // بيع عاجل (يظهر بتنبيه خاص)
      }
    };
  }

  // حساب رسوم إنشاء المزاد
  calculateListingFee(type = 'basic') {
    const fee = this.config.listingFee[type] || this.config.listingFee.basic;
    const burn = fee * this.config.burnRate.listing / 100;
    
    return {
      total: fee,
      platformRevenue: fee - burn, // ما يذهب للمنصة
      burned: burn,                // ما يتم حرقه
      currency: 'BID'
    };
  }

  // حساب عمولة البيع
  calculateSaleCommission(salePrice, category = 'default') {
    const rate = this.config.saleCommission[category] || this.config.saleCommission.default;
    const commission = salePrice * rate / 100;
    const burn = commission * this.config.burnRate.sale / 100;
    
    return {
      salePrice: salePrice,
      commissionRate: rate,
      totalCommission: commission,
      platformRevenue: commission - burn,
      burned: burn,
      sellerReceives: salePrice - commission,
      currency: 'PI' // العمولة بنفس عملة المزاد
    };
  }

  // حساب رسوم المزايدة
  calculateBidFee(bidderBidCount = 0) {
    // أول 3 مزايدات مجانية
    if (bidderBidCount < this.config.bidFee.freeForFirst) {
      return {
        total: 0,
        isFree: true,
        message: `مجاني! (${this.config.bidFee.freeForFirst - bidderBidCount} مزايدات مجانية متبقية)`
      };
    }
    
    const fee = this.config.bidFee.amount;
    const burn = fee * this.config.burnRate.bid / 100;
    
    return {
      total: fee,
      isFree: false,
      platformRevenue: fee - burn,
      burned: burn,
      currency: 'BID'
    };
  }

  // حساب أرباح المنصة من مزاد كامل (تقديري)
  estimatePlatformRevenue(salePrice, category, bidCount, listingType = 'basic') {
    const listing = this.calculateListingFee(listingType);
    const sale = this.calculateSaleCommission(salePrice, category);
    const bids = {
      totalFees: Math.max(0, (bidCount - this.config.bidFee.freeForFirst) * this.config.bidFee.amount),
      burned: Math.max(0, (bidCount - this.config.bidFee.freeForFirst) * this.config.bidFee.amount * this.config.burnRate.bid / 100)
    };
    
    const totalRevenue = listing.platformRevenue + sale.platformRevenue + (bids.totalFees - bids.burned);
    const totalBurned = listing.burned + sale.burned + bids.burned;
    
    return {
      listingFee: listing.platformRevenue,
      saleCommission: sale.platformRevenue,
      bidFees: bids.totalFees - bids.burned,
      totalPlatformRevenue: totalRevenue,
      totalBurned: totalBurned,
      currency: 'BID/PI',
      breakdown: {
        'رسوم الإدراج': listing.platformRevenue,
        'عمولة البيع': sale.platformRevenue,
        'رسوم المزايدات': bids.totalFees - bids.burned,
        'إجمالي الأرباح': totalRevenue,
        'تم حرقه': totalBurned
      }
    };
  }

  // الحصول على باقات العضوية
  getMembershipPlans() {
    return this.config.membership;
  }

  // حساب سعر الخدمات الإضافية
  getServicePrice(service) {
    return this.config.services[service] || 0;
  }

  // عرض ملخص الأرباح (للوحة التحكم)
  getRevenueSummary(stats) {
    const listingRevenue = (stats.totalListings || 0) * this.config.listingFee.basic;
    const saleRevenue = (stats.totalSales || 0) * 1000 * 0.03; // تقديري
    const bidRevenue = Math.max(0, ((stats.totalBids || 0) - (stats.totalBidders || 0) * 3)) * this.config.bidFee.amount;
    const membershipRevenue = (stats.proMembers || 0) * 100 + (stats.vipMembers || 0) * 500;
    
    return {
      listingRevenue,
      saleRevenue,
      bidRevenue,
      membershipRevenue,
      totalRevenue: listingRevenue + saleRevenue + bidRevenue + membershipRevenue,
      currency: 'BID'
    };
  }
}

export const feesService = new FeesService();
export default feesService;
