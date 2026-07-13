/**
 * Pi DEX Service
 * محاكاة كاملة لمنصة التداول اللامركزية Pi DEX
 */

class PiDexService {
  constructor() {
    this.pools = {
      'BIDX/PI': {
        tokenA: 'BIDX',
        tokenB: 'PI',
        reserveA: 5000000, // 5 مليون BIDX
        reserveB: 50000,   // 50 ألف Pi
        totalLiquidity: 500000,
        apr: 45.5, // العائد السنوي
        volume24h: 12500
      }
    };

    this.orders = [];
    this.userLiquidity = {};
  }

  // تبديل توكن
  async swap(fromToken, toToken, amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const poolKey = fromToken + '/' + toToken;
        const pool = this.pools[poolKey];
        
        if (!pool) {
          resolve({ success: false, error: 'الزوج غير موجود' });
          return;
        }

        // حساب السعر
        const price = pool.reserveB / pool.reserveA;
        const received = amount * price * 0.997; // 0.3% رسوم

        // تحديث الاحتياطيات
        pool.reserveA += amount;
        pool.reserveB -= received;

        resolve({
          success: true,
          txId: 'dex_' + Date.now(),
          fromToken,
          toToken,
          sent: amount,
          received: received,
          price: price,
          fee: amount * 0.003,
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  }

  // إضافة سيولة
  async addLiquidity(poolKey, amountA, amountB, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.userLiquidity[userId]) {
          this.userLiquidity[userId] = {};
        }
        this.userLiquidity[userId][poolKey] = (this.userLiquidity[userId][poolKey] || 0) + amountA;

        resolve({
          success: true,
          txId: 'lp_' + Date.now(),
          poolKey,
          amountA,
          amountB,
          share: (amountA / this.pools[poolKey].reserveA) * 100
        });
      }, 2000);
    });
  }

  // سحب السيولة
  async removeLiquidity(poolKey, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const amount = this.userLiquidity[userId]?.[poolKey] || 0;
        if (this.userLiquidity[userId]) {
          this.userLiquidity[userId][poolKey] = 0;
        }

        resolve({
          success: true,
          txId: 'rmlp_' + Date.now(),
          amount: amount,
          fee: amount * 0.001
        });
      }, 2000);
    });
  }

  // الحصول على سعر التوكن
  getTokenPrice(poolKey) {
    const pool = this.pools[poolKey];
    if (!pool) return 0;
    return pool.reserveB / pool.reserveA;
  }

  // الحصول على كل المجمعات
  getAllPools() {
    return Object.entries(this.pools).map(([key, pool]) => ({
      pair: key,
      ...pool,
      price: pool.reserveB / pool.reserveA,
      priceChange24h: Math.random() * 10 - 5
    }));
  }

  // سيولة المستخدم
  getUserLiquidity(userId) {
    return this.userLiquidity[userId] || {};
  }
}

export const piDex = new PiDexService();
export default piDex;
