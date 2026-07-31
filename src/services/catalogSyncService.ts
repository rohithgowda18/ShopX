import { collection, doc, getDocs, setDoc, getDoc, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CatalogProduct } from '../catalog/types/productTypes';
import { karnatakaCatalog } from '../catalog/local/karnatakaCatalog';
import { catalogService } from '../catalog/services/catalogService';

export class CatalogSyncService {
  private masterCollection = collection(db, 'masterProducts');

  async syncMasterCatalogToFirestore() {
    const promises = karnatakaCatalog.map(async (product) => {
      const docRef = doc(this.masterCollection, product.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, product);
      }
    });
    await Promise.all(promises);
  }

  async getMasterCatalogFromFirestore(): Promise<CatalogProduct[]> {
    const snapshot = await getDocs(this.masterCollection);
    return snapshot.docs.map(doc => doc.data() as CatalogProduct);
  }

  async saveMasterProduct(product: CatalogProduct) {
    const docRef = doc(this.masterCollection, product.id);
    await setDoc(docRef, product, { merge: true });
  }
}

export const catalogSyncService = new CatalogSyncService();
