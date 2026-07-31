import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CatalogProduct, ShopInventoryItem, HybridProduct } from '../types/productTypes';
import { masterCatalog } from '../master/masterCatalog';
import { karnatakaCatalog } from '../local/karnatakaCatalog';

interface CatalogDB extends DBSchema {
  master: {
    key: string;
    value: CatalogProduct;
  };
  local: {
    key: string;
    value: CatalogProduct;
  };
}

class CatalogService {
  private masterCache: Map<string, CatalogProduct> = new Map();
  private localCache: Map<string, CatalogProduct> = new Map();
  private shopInventoryCache: Map<string, ShopInventoryItem> = new Map();
  private activeShopId: string | null = null;
  private dbPromise: Promise<IDBPDatabase<CatalogDB>>;

  constructor() {
    this.initCachesSync();
    this.dbPromise = this.initDB();
  }

  private initCachesSync() {
    masterCatalog.forEach(p => this.masterCache.set(p.id, p));
    karnatakaCatalog.forEach(p => this.localCache.set(p.id, p));
  }

  private async initDB() {
    const db = await openDB<CatalogDB>('kirana-catalog-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('master')) {
          db.createObjectStore('master', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('local')) {
          db.createObjectStore('local', { keyPath: 'id' });
        }
      },
    });
    return db;
  }

  public async initialize() {
    try {
      const db = await this.dbPromise;
      let localItems = await db.getAll('local');
      let masterItems = await db.getAll('master');

      if (localItems.length === 0) {
        const tx = db.transaction('local', 'readwrite');
        await Promise.all(karnatakaCatalog.map(p => tx.store.put(p)));
        await tx.done;
        localItems = karnatakaCatalog;
      }

      if (masterItems.length === 0 && masterCatalog.length > 0) {
        const tx = db.transaction('master', 'readwrite');
        await Promise.all(masterCatalog.map(p => tx.store.put(p)));
        await tx.done;
        masterItems = masterCatalog;
      }

      masterItems.forEach(p => this.masterCache.set(p.id, p));
      localItems.forEach(p => this.localCache.set(p.id, p));
    } catch (e) {
      console.warn("Could not initialize IDB offline catalog. Falling back to memory cache.", e);
    }
  }

  public setShopInventory(inventory: ShopInventoryItem[], shopId: string) {
    this.activeShopId = shopId;
    this.shopInventoryCache.clear();
    inventory.forEach(item => {
      this.shopInventoryCache.set(item.productId, item);
    });
  }

  public getProductDetails(productId: string): CatalogProduct | undefined {
    return this.masterCache.get(productId) || this.localCache.get(productId);
  }

  public getHybridProduct(productId: string): HybridProduct | undefined {
    const product = this.getProductDetails(productId);
    if (!product) return undefined;

    const inventory = this.shopInventoryCache.get(productId);
    
    // If a shop is active, only return if it exists in inventory and is available
    if (this.activeShopId) {
      if (!inventory || !inventory.available) {
        return undefined;
      }
    }

    return {
      ...product,
      inventory,
      shopPrice: inventory?.price || product.price || 0
    };
  }

  public getAllHybridProducts(): HybridProduct[] {
    const allProducts = new Map<string, CatalogProduct>();
    
    this.masterCache.forEach((v, k) => allProducts.set(k, v));
    this.localCache.forEach((v, k) => allProducts.set(k, v));

    const hybridList: HybridProduct[] = [];

    Array.from(allProducts.values()).forEach(p => {
      const inventory = this.shopInventoryCache.get(p.id);
      
      // Filter by active shop inventory if shop is selected
      if (this.activeShopId) {
        if (!inventory || !inventory.available) {
          return; // Skip product
        }
      }

      hybridList.push({
        ...p,
        inventory,
        shopPrice: inventory?.price || p.price || 0
      });
    });

    return hybridList;
  }
}

export const catalogService = new CatalogService();
