import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CatalogProduct } from '../types/productTypes';
import { karnatakaCatalog } from '../local/karnatakaCatalog';

const MASTER_COLLECTION = 'catalog/masterProducts/items'; // Or just 'masterProducts'

export const syncMasterCatalogToFirestore = async (products: CatalogProduct[]) => {
  try {
    for (const product of products) {
      const docRef = doc(db, 'masterProducts', product.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, product);
      }
    }
  } catch (error) {
    console.error('Error syncing master catalog:', error);
  }
};

export const fetchMasterCatalogFromFirestore = async (): Promise<CatalogProduct[]> => {
  try {
    const q = collection(db, 'masterProducts');
    const snap = await getDocs(q);
    if (snap.empty) {
      // Initialize with local catalog if empty
      await syncMasterCatalogToFirestore(karnatakaCatalog);
      return karnatakaCatalog;
    }
    return snap.docs.map(doc => doc.data() as CatalogProduct);
  } catch (error) {
    console.error('Error fetching master catalog:', error);
    return [];
  }
};
