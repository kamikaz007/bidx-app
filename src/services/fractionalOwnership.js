import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

class FractionalOwnershipService {
  constructor() {
    this.collection = 'fractionalAssets';
  }

  async createFractionalAsset(assetData, creatorId, imageFiles = []) {
    try {
      // تحويل الصور إلى Base64
      let images = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          images.push(base64);
        }
      } else if (assetData.images && assetData.images.length > 0) {
        // إذا مررت الصور كـ Base64 مباشرة
        images = assetData.images;
      }

      const assetRef = await addDoc(collection(db, this.collection), {
        title: assetData.title,
        description: assetData.description || '',
        category: assetData.category || 'realestate',
        location: assetData.location || 'تونس',
        totalShares: assetData.totalShares,
        availableShares: assetData.totalShares,
        pricePerShare: assetData.pricePerShare,
        minimumShares: assetData.minimumShares || 1,
        currency: 'PI',
        totalValuation: assetData.totalValuation || (assetData.totalShares * assetData.pricePerShare),
        annualYield: assetData.annualYield || 0,
        shareholders: [],
        numberOfHolders: 0,
        creatorId: creatorId,
        status: 'active',
        isVerified: false,
        images: images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ تم إنشاء الأصل مع', images.length, 'صورة');
      return { success: true, assetId: assetRef.id };
    } catch (error) {
      console.error('❌ فشل:', error);
      return { success: false, error: error.message };
    }
  }

  async getAvailableFractionalAssets(limitCount = 100) {
    try {
      const q = query(collection(db, this.collection), limit(limitCount));
      const snapshot = await getDocs(q);
      const assets = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        assets.push({
          id: doc.id,
          title: d.title || 'بدون عنوان',
          description: d.description || '',
          location: d.location || 'غير محدد',
          totalShares: d.totalShares || 1000,
          availableShares: d.availableShares ?? d.totalShares,
          pricePerShare: d.pricePerShare || 100,
          annualYield: d.annualYield || 0,
          images: d.images || [],
          status: d.status || 'active',
          numberOfHolders: d.numberOfHolders || 0,
          category: d.category || 'other'
        });
      });
      return assets;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async purchaseShares(assetId, shares, buyerId) {
    try {
      const assetRef = doc(db, this.collection, assetId);
      const assetSnap = await getDoc(assetRef);
      if (!assetSnap.exists()) throw new Error('الأصل غير موجود');
      
      const asset = assetSnap.data();
      const available = asset.availableShares ?? asset.totalShares;
      
      if (available < shares) throw new Error(`فقط ${available} حصة متاحة`);
      
      const totalCost = shares * asset.pricePerShare;
      await updateDoc(assetRef, {
        availableShares: increment(-shares),
        numberOfHolders: increment(1),
        shareholders: arrayUnion({ 
          userId: buyerId, 
          shares, 
          totalInvested: totalCost, 
          purchaseDate: serverTimestamp() 
        }),
        updatedAt: serverTimestamp()
      });

      return { success: true, totalCost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // دالة مساعدة لتحويل الملفات إلى Base64
  async filesToBase64(files) {
    const result = [];
    for (const file of files) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      result.push(base64);
    }
    return result;
  }
}

export const fractionalOwnership = new FractionalOwnershipService();
export default fractionalOwnership;
