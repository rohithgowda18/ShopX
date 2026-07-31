import { Product } from '../../types';
import { HybridProduct } from '../types/productTypes';
import { PRODUCTS } from '../../data/products';

export const mapHybridToLegacyProduct = (hybrid: HybridProduct): Product => {
  // If we don't have inventory, we can try falling back to the old PRODUCTS prices
  // so the UI doesn't break if shop inventory is not initialized
  const legacyProd = PRODUCTS.find(p => p.id === hybrid.id);
  
  return {
    id: hybrid.id,
    shopId: hybrid.inventory?.shopId || 'default-shop',
    name: hybrid.englishName, // Using englishName for the name
    category: hybrid.category,
    price: hybrid.inventory?.price || legacyProd?.price || 0,
    unit: (hybrid.inventory?.packSize as any) || hybrid.defaultUnit,
    inStock: hybrid.inventory ? hybrid.inventory.stock > 0 : (legacyProd ? legacyProd.inStock : true),
    barcode: hybrid.barcode
  };
};

export const mapLegacyToInventory = (product: Product): import('../types/productTypes').ShopInventoryItem => {
  return {
    productId: product.id,
    shopId: product.shopId,
    price: product.price,
    stock: product.inStock ? 100 : 0,
    available: product.inStock,
    lastUpdated: Date.now()
  };
};
