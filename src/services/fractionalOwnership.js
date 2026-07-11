import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { piBlockchain } from './piBlockchain';

class FractionalOwnershipService {
  constructor() {
    this.collection = 'fractionalAssets';
  }

  // إنشاء أصل جديد للتجزئة
  async createFractionalAsset(assetData, creatorId) {
    try {
      // 1. ترميز الأصل على Pi Testnet
      const blockchainAsset = await piBlockchain.tokenizeAsset({
        name: assetData.title,
        description: assetData.description,
        totalShares: assetData.totalShares,
        pricePerShare: assetData.pricePerShare,
        symbol: `BIDX_${Date.now().toString(36).toUpperCase()}`
      });

      // 2. حفظ في Firebase
      const assetRef = await addDoc(collection(db, this.collection), {
        title: assetData.title,
        description: assetData.description,
        category: assetData.category || 'realestate',
        imageUrl: assetData.imageUrl || '',
        
        // تفاصيل التجزئة
        totalShares: assetData.totalShares,
        availableShares: assetData.totalShares,
        pricePerShare: assetData.pricePerShare,
        minimumShares: assetData.minimumShares || 1,
        currency: 'PI',
        
        // التقييم
        totalValuation: assetData.totalShares * assetData.pricePerShare,
        currentValuation: assetData.totalShares * assetData.pricePerShare,
        
        // العوائد
        annualYield: assetData.annualYield || 0,
        dividendPerShare: 0,
        
        // المالكين
        shareholders: [],
        numberOfHolders: 0,
        
        // البلوكشين
        blockchainAssetId: blockchainAsset.success ? blockchainAsset.asset.code : null,
        blockchainTx: blockchainAsset.success ? blockchainAsset.asset : null,
        network: 'pi_testnet',
        
        // البيانات الإدارية
        creatorId: creatorId,
        status: 'active',
        isVerified: false,
        location: assetData.location || 'غير محدد',
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ تم إنشاء الأصل المجزأ:', assetRef.id);
      return { success: true, assetId: assetRef.id };
    } catch (error) {
      console.error('❌ فشل إنشاء الأصل المجزأ:', error);
      return { success: false, error: error.message };
    }
  }

  // شراء حصص
  async purchaseShares(assetId, shares, buyerId) {
    try {
      const assetRef = doc(db, this.collection, assetId);
      const assetSnap = await getDoc(assetRef);

      if (!assetSnap.exists()) {
        throw new Error('الأصل غير موجود');
      }

      const asset = assetSnap.data();

      // التحقق من توفر الحصص
      if (asset.availableShares < shares) {
        throw new Error(`فقط ${asset.availableShares} حصة متاحة`);
      }

      if (shares < asset.minimumShares) {
        throw new Error(`الحد الأدنى للشراء: ${asset.minimumShares} حصة`);
      }

      const totalCost = shares * asset.pricePerShare;

      // 1. تنفيذ المعاملة على Pi Testnet
      const blockchainTx = await piBlockchain.buyShares(
        asset.blockchainAssetId,
        shares,
        buyerId
      );

      // 2. تحديث Firebase
      const shareholderEntry = {
        userId: buyerId,
        shares: shares,
        purchasePrice: asset.pricePerShare,
        totalInvested: totalCost,
        purchaseDate: serverTimestamp(),
        transactionId: blockchainTx.success ? blockchainTx.transaction.id : null,
        network: 'pi_testnet'
      };

      await updateDoc(assetRef, {
        availableShares: increment(-shares),
        sharesSold: increment(shares),
        numberOfHolders: increment(1),
        shareholders: arrayUnion(shareholderEntry),
        currentValuation: (asset.totalShares - asset.availableShares + shares) * asset.pricePerShare,
        updatedAt: serverTimestamp()
      });

      // 3. تحديث محفظة المشتري
      await this.updateUserPortfolio(buyerId, assetId, shares, totalCost);

      return {
        success: true,
        sharesPurchased: shares,
        totalCost: totalCost,
        transactionId: blockchainTx.success ? blockchainTx.transaction.id : null,
        network: 'pi_testnet'
      };
    } catch (error) {
      console.error('❌ فشل شراء الحصص:', error);
      return { success: false, error: error.message };
    }
  }

  // بيع حصص
  async sellShares(assetId, shares, sellerId) {
    try {
      const assetRef = doc(db, this.collection, assetId);
      const assetSnap = await getDoc(assetRef);

      if (!assetSnap.exists()) {
        throw new Error('الأصل غير موجود');
      }

      const asset = assetSnap.data();

      // تنفيذ البيع على البلوكشين
      await piBlockchain.sellShares(asset.blockchainAssetId, shares, sellerId);

      // تحديث Firebase
      await updateDoc(assetRef, {
        availableShares: increment(shares),
        sharesSold: increment(-shares),
        numberOfHolders: increment(-1),
        updatedAt: serverTimestamp()
      });

      return { success: true, sharesSold: shares };
    } catch (error) {
      console.error('❌ فشل بيع الحصص:', error);
      return { success: false, error: error.message };
    }
  }

  // تحديث محفظة المستخدم
  async updateUserPortfolio(userId, assetId, shares, amount) {
    try {
      const portfolioRef = await addDoc(collection(db, 'portfolios'), {
        userId: userId,
        assetId: assetId,
        shares: shares,
        totalInvested: amount,
        network: 'pi_testnet',
        createdAt: serverTimestamp()
      });

      return portfolioRef.id;
    } catch (error) {
      console.error('فشل تحديث المحفظة:', error);
    }
  }

  // جلب الأصول المجزأة المتاحة
  async getAvailableFractionalAssets(category = null, limitCount = 20) {
    try {
      let q = query(
        collection(db, this.collection),
        where('status', '==', 'active'),
        where('availableShares', '>', 0),
        orderBy('availableShares', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const assets = [];
      snapshot.forEach(doc => {
        assets.push({ id: doc.id, ...doc.data() });
      });

      return assets;
    } catch (error) {
      console.error('فشل جلب الأصول:', error);
      return [];
    }
  }

  // جلب محفظة المستخدم
  async getUserPortfolio(userId) {
    try {
      const q = query(
        collection(db, 'portfolios'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const portfolio = [];
      snapshot.forEach(doc => {
        portfolio.push({ id: doc.id, ...doc.data() });
      });

      return portfolio;
    } catch (error) {
      console.error('فشل جلب المحفظة:', error);
      return [];
    }
  }

  // حساب العوائد
  async calculateDividends(assetId) {
    try {
      const asset = await getDoc(doc(db, this.collection, assetId));
      if (asset.exists()) {
        const data = asset.data();
        const dividendPerShare = (data.annualYield / 100) * data.pricePerShare;
        return {
          annualYield: data.annualYield,
          dividendPerShare: dividendPerShare,
          totalDividends: dividendPerShare * data.totalShares
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const fractionalOwnership = new FractionalOwnershipService();
export default fractionalOwnership;
