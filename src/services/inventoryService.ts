import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ShopInventoryItem, HybridProduct } from '../catalog/types/productTypes';
import { catalogService } from '../catalog/services/catalogService';

export class InventoryService {
  async getShopInventory(shopId: string): Promise<ShopInventoryItem[]> {
    if (!shopId) return [];
    const inventoryRef = collection(db, 'shops', shopId, 'inventory');
    const snapshot = await getDocs(inventoryRef);
    return snapshot.docs.map(doc => doc.data() as ShopInventoryItem);
  }

  async getInventoryItem(shopId: string, productId: string): Promise<ShopInventoryItem | null> {
    if (!shopId || !productId) return null;
    const inventoryRef = doc(db, 'shops', shopId, 'inventory', productId);
    const snap = await getDoc(inventoryRef);
    if (snap.exists()) return snap.data() as ShopInventoryItem;
    return null;
  }

  async saveInventoryItem(item: ShopInventoryItem) {
    const inventoryRef = doc(db, 'shops', item.shopId, 'inventory', item.productId);
    await setDoc(inventoryRef, item, { merge: true });
  }

  async removeInventoryItem(shopId: string, productId: string) {
    const inventoryRef = doc(db, 'shops', shopId, 'inventory', productId);
    await deleteDoc(inventoryRef);
  }
  
  async getHybridProductsForShop(shopId: string): Promise<HybridProduct[]> {
    const inventory = await this.getShopInventory(shopId);
    catalogService.setShopInventory(inventory, shopId);
    
    const hybridProducts: HybridProduct[] = [];
    for (const item of inventory) {
      if (item.available) {
        const p = catalogService.getHybridProduct(item.productId);
        if (p) {
          p.shopPrice = item.price;
          hybridProducts.push(p);
        }
      }
    }
    return hybridProducts;
  }
}

export const inventoryService = new InventoryService();
