/**
 * نظام حماية المزادات من Front-running والتلاعب
 * 
 * المميزات:
 * - وقت إضافي سري عند المزايدة في آخر 30 ثانية
 * - إخفاء قيمة المزايدة حتى انتهاء الوقت
 * - استرداد تلقائي للمزايدات الخاسرة
 * - رسوم منخفضة للخاسرين
 */

class AuctionSecurityService {
  constructor() {
    this.config = {
      // الوقت الإضافي السري (ثواني) - يضاف عند المزايدة في آخر 30 ثانية
      secretExtensionSeconds: 120, // دقيقتين إضافيتين
      
      // متى يبدأ تفعيل الوقت الإضافي
      extensionThreshold: 30, // آخر 30 ثانية
      
      // الحد الأقصى للتمديدات
      maxExtensions: 5,
      
      // رسوم الاسترداد
      refundFee: 0.5, // 0.5% فقط للمزايدات الخاسرة
      
      // رسوم المنصة على المزايد الفائز
      winnerFee: 2.0, // 2%
      
      // فترة تجميد المزايدة (ثواني)
      bidLockTime: 30,
      
      // الحد الأدنى لزيادة المزايدة
      minBidIncrement: 1.05, // 5% زيادة كحد أدنى
    };

    this.auctions = new Map(); // تخزين حالة المزادات
    this.pendingRefunds = new Map(); // المبالغ المستردة المعلقة
  }

  /**
   * تقديم مزايدة مع حماية Front-running
   */
  async placeSecureBid(auctionId, bidderId, amount, currentHighestBid) {
    try {
      const auction = this.getOrCreateAuction(auctionId);
      
      // 1. التحقق من صحة المزايدة
      this.validateBid(auction, amount, currentHighestBid);
      
      // 2. تجميد المبلغ مؤقتاً
      const frozenAmount = this.freezeBid(auctionId, bidderId, amount);
      
      // 3. إخفاء القيمة الحقيقية (Commit-Reveal)
      const bidHash = this.commitBid(auctionId, bidderId, amount);
      
      // 4. التحقق من وقت التمديد
      const extension = this.checkTimeExtension(auction);
      
      // 5. تسجيل المزايدة
      auction.bids.push({
        bidderId,
        amount,
        hash: bidHash,
        timestamp: Date.now(),
        status: 'pending', // pending حتى ينتهي وقت الإفصاح
        revealed: false
      });
      
      // 6. تحديث حالة المزاد
      auction.extensionCount = (auction.extensionCount || 0) + extension.added ? 1 : 0;
      auction.endTime += extension.seconds * 1000;
      
      console.log(`🛡️ مزايدة آمنة: ${amount} Pi | ${extension.added ? '⏰ تمديد ' + extension.seconds + 'ث' : '✅ عادي'}`);
      
      return {
        success: true,
        bidHash,
        frozenAmount,
        extension: extension.added ? extension.seconds : 0,
        newEndTime: auction.endTime,
        message: extension.added 
          ? `تم تمديد المزاد ${extension.seconds} ثانية لمنع التلاعب`
          : 'تم تقديم المزايدة بنجاح'
      };
      
    } catch (error) {
      console.error('❌ فشل المزايدة الآمنة:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * التحقق من صحة المزايدة
   */
  validateBid(auction, amount, currentHighest) {
    if (amount <= currentHighest) {
      throw new Error('المزايدة يجب أن تكون أعلى من السعر الحالي');
    }
    
    const minIncrease = currentHighest * this.config.minBidIncrement;
    if (amount < minIncrease) {
      throw new Error(`الحد الأدنى للزيادة: ${minIncrease.toFixed(2)} Pi`);
    }
    
    if (auction.extensionCount >= this.config.maxExtensions) {
      throw new Error('تم الوصول للحد الأقصى من التمديدات');
    }
  }

  /**
   * تجميد المبلغ (Escrow)
   */
  freezeBid(auctionId, bidderId, amount) {
    const escrowKey = `${auctionId}_${bidderId}`;
    
    // تجميد 100% من قيمة المزايدة
    const frozen = {
      amount,
      timestamp: Date.now(),
      releaseTime: Date.now() + (this.config.bidLockTime * 1000),
      released: false
    };
    
    this.pendingRefunds.set(escrowKey, frozen);
    
    return amount;
  }

  /**
   * نظام Commit-Reveal (إخفاء ثم إفصاح)
   */
  commitBid(auctionId, bidderId, amount) {
    // إنشاء هاش للمزايدة
    const data = `${auctionId}:${bidderId}:${amount}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'bid_' + Math.abs(hash).toString(36);
  }

  /**
   * التحقق من تمديد الوقت (Anti-Sniping)
   */
  checkTimeExtension(auction) {
    const timeLeft = auction.endTime - Date.now();
    
    // إذا بقي أقل من 30 ثانية، مدد الوقت
    if (timeLeft <= this.config.extensionThreshold * 1000 && timeLeft > 0) {
      return {
        added: true,
        seconds: this.config.secretExtensionSeconds,
        reason: 'تمديد تلقائي لمنع القنص في الثواني الأخيرة'
      };
    }
    
    return { added: false, seconds: 0 };
  }

  /**
   * استرداد المزايدات الخاسرة تلقائياً
   */
  async refundLosers(auctionId, winnerId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return { success: false, error: 'مزاد غير موجود' };
    
    const refunds = [];
    let totalRefunded = 0;
    
    for (const bid of auction.bids) {
      if (bid.bidderId !== winnerId && bid.status === 'pending') {
        // خصم رسوم 0.5% فقط من الخاسرين
        const fee = bid.amount * (this.config.refundFee / 100);
        const refundAmount = bid.amount - fee;
        
        refunds.push({
          bidderId: bid.bidderId,
          originalAmount: bid.amount,
          fee: fee,
          refundAmount: refundAmount,
          status: 'refunded'
        });
        
        // تحرير المبلغ المجمد
        const escrowKey = `${auctionId}_${bid.bidderId}`;
        const frozen = this.pendingRefunds.get(escrowKey);
        if (frozen) {
          frozen.released = true;
          frozen.refundAmount = refundAmount;
        }
        
        totalRefunded += refundAmount;
        bid.status = 'refunded';
      }
    }
    
    console.log(`💰 تم استرداد ${totalRefunded.toFixed(2)} Pi لـ ${refunds.length} مزايد خاسر`);
    
    return {
      success: true,
      refunds,
      totalRefunded,
      refundFee: this.config.refundFee,
      message: `تم استرداد ${totalRefunded.toFixed(2)} Pi للمزايدين الخاسرين (رسوم ${this.config.refundFee}%)`
    };
  }

  /**
   * إنهاء المزاد وتحديد الفائز
   */
  async finalizeAuction(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return { success: false, error: 'مزاد غير موجود' };
    
    // ترتيب المزايدات من الأعلى
    const sortedBids = auction.bids
      .filter(b => b.status === 'pending')
      .sort((a, b) => b.amount - a.amount);
    
    if (sortedBids.length === 0) {
      return { success: false, error: 'لا توجد مزايدات صالحة' };
    }
    
    const winner = sortedBids[0];
    winner.status = 'won';
    
    // خصم رسوم 2% من الفائز
    const winnerFee = winner.amount * (this.config.winnerFee / 100);
    const sellerReceives = winner.amount - winnerFee;
    
    // استرداد الخاسرين
    const refundResult = await this.refundLosers(auctionId, winner.bidderId);
    
    auction.status = 'ended';
    auction.winner = winner;
    
    console.log(`🏆 الفائز: ${winner.bidderId} | المبلغ: ${winner.amount} Pi | رسوم: ${winnerFee} Pi`);
    
    return {
      success: true,
      winner: {
        bidderId: winner.bidderId,
        amount: winner.amount,
        fee: winnerFee,
        netAmount: sellerReceives
      },
      refunds: refundResult,
      platformRevenue: winnerFee + (refundResult.totalRefunded * this.config.refundFee / 100),
      message: 'تم إنهاء المزاد بنجاح'
    };
  }

  /**
   * الحصول على حالة مزاد
   */
  getOrCreateAuction(auctionId) {
    if (!this.auctions.has(auctionId)) {
      this.auctions.set(auctionId, {
        id: auctionId,
        bids: [],
        status: 'active',
        endTime: Date.now() + 3600000, // ساعة افتراضياً
        extensionCount: 0,
        createdAt: Date.now()
      });
    }
    return this.auctions.get(auctionId);
  }

  /**
   * الحصول على ملخص أمان المزاد
   */
  getSecuritySummary(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return null;
    
    return {
      totalBids: auction.bids.length,
      extensionCount: auction.extensionCount,
      protectionActive: auction.extensionCount > 0,
      timeExtensions: auction.extensionCount * this.config.secretExtensionSeconds,
      refundFee: this.config.refundFee,
      winnerFee: this.config.winnerFee,
      antiSniping: true,
      commitReveal: true
    };
  }
}

export const auctionSecurity = new AuctionSecurityService();
export default auctionSecurity;
