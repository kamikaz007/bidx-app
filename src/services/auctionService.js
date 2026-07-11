import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, serverTimestamp, increment, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

class AuctionService {
  async createAuction(auctionData, sellerId) {
    try {
      const auctionRef = await addDoc(collection(db, 'auctions'), {
        title: auctionData.title,
        description: auctionData.description || '',
        category: auctionData.category || 'other',
        startingPrice: auctionData.startingPrice,
        currentPrice: auctionData.startingPrice,
        minBidIncrement: auctionData.minBidIncrement || 100,
        currency: auctionData.currency || 'PI',
        endTime: Timestamp.fromDate(auctionData.endTime),
        location: auctionData.location || 'تونس',
        assetType: auctionData.assetType || 'physical',
        sellerId: sellerId,
        sellerName: auctionData.sellerName || 'مستخدم',
        status: 'active',
        views: 0,
        totalBids: 0,
        isVerified: false,
        images: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ تم إنشاء المزاد بنجاح:', auctionRef.id);
      return { success: true, auctionId: auctionRef.id };
    } catch (error) {
      console.error('❌ فشل إنشاء المزاد:', error);
      throw error;
    }
  }

  async getActiveAuctions(category = null, limitCount = 50) {
    try {
      // جلب جميع المزادات بدون فلترة معقدة
      const q = query(
        collection(db, 'auctions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const auctions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // فلترة المزادات النشطة فقط
        if (data.status === 'active') {
          // فلترة حسب الفئة إذا كانت محددة
          if (!category || category === 'all' || data.category === category) {
            auctions.push({
              id: doc.id,
              ...data,
              endTime: data.endTime ? data.endTime.toDate() : new Date(Date.now() + 86400000)
            });
          }
        }
      });

      console.log(`✅ تم جلب ${auctions.length} مزاد نشط`);
      return auctions;
    } catch (error) {
      console.error('❌ فشل جلب المزادات:', error);
      return [];
    }
  }

  async getAuction(auctionId) {
    try {
      const auctionSnap = await getDoc(doc(db, 'auctions', auctionId));
      if (auctionSnap.exists()) {
        const data = auctionSnap.data();
        return {
          id: auctionSnap.id,
          ...data,
          endTime: data.endTime ? data.endTime.toDate() : new Date()
        };
      }
      return null;
    } catch (error) {
      console.error('فشل جلب المزاد:', error);
      return null;
    }
  }

  async placeBid(auctionId, bidderId, amount) {
    try {
      const auctionRef = doc(db, 'auctions', auctionId);
      await addDoc(collection(db, 'bids'), {
        auctionId, bidderId, amount,
        timestamp: serverTimestamp()
      });
      await updateDoc(auctionRef, {
        currentPrice: amount,
        totalBids: increment(1),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('فشل تقديم المزايدة:', error);
      throw error;
    }
  }

  async getAuctionBids(auctionId) {
    try {
      const q = query(
        collection(db, 'bids'),
        where('auctionId', '==', auctionId),
        orderBy('amount', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const bids = [];
      snapshot.forEach(doc => bids.push({ id: doc.id, ...doc.data() }));
      return bids;
    } catch (error) {
      return [];
    }
  }
}

export const auctionService = new AuctionService();
export default auctionService;
