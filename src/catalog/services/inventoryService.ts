import { collection, doc, getDocs, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ShopInventoryItem } from '../types/productTypes';

export const fetchShopInventory = async (shopId: string): Promise<ShopInventoryItem[]> => {
  try {
    const q = collection(db, `shops/${shopId}/inventory`);
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as ShopInventoryItem);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
};

export const saveShopInventoryItem = async (shopId: string, item: ShopInventoryItem) => {
  try {
    const docRef = doc(db, `shops/${shopId}/inventory`, item.productId);
    await setDoc(docRef, { ...item, shopId, lastUpdated: Date.now() }, { merge: true });
  } catch (error) {
    console.error('Error saving inventory item:', error);
    throw error;
  }
};

export const updateInventoryStock = async (shopId: string, productId: string, stock: number, available: boolean) => {
  try {
    const docRef = doc(db, `shops/${shopId}/inventory`, productId);
    await updateDoc(docRef, { stock, available, lastUpdated: Date.now() });
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    throw error;
  }
};
