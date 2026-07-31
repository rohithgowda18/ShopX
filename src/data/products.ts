import { CATEGORIES } from './types';
import { catalogService } from '../catalog/services/catalogService';
import { searchHybridProducts, getHybridProductsByCategory } from '../catalog/utils/searchProducts';
import { HybridProduct, Category, Unit } from '../catalog/types/productTypes';

export { CATEGORIES };
export type { Category };

export type Product = Omit<HybridProduct, 'defaultUnit'> & {
  name: string;
  transliteration: string;
  defaultUnit: Unit;
  inStock?: boolean;
  price: number;
};

// Auto-evaluate for backward compatibility
export const PRODUCTS: Product[] = catalogService.getAllHybridProducts().map(p => ({
  ...p,
  name: p.englishName,
  transliteration: p.aliases[p.aliases.length - 1] || '',
  defaultUnit: p.defaultUnit as Unit,
  price: p.shopPrice || p.price || 0,
  inStock: p.inventory ? p.inventory.available && p.inventory.stock > 0 : true
}));

export const refreshProductsFromCatalog = (products: HybridProduct[]) => {
  PRODUCTS.length = 0;
  PRODUCTS.push(...products.map(p => ({
    ...p,
    name: p.englishName,
    transliteration: p.aliases[p.aliases.length - 1] || '',
    defaultUnit: p.defaultUnit as Unit,
    price: p.shopPrice || p.price || 0,
    inStock: p.inventory ? p.inventory.available && p.inventory.stock > 0 : true
  })));
};

export const searchProducts = (query: string): Product[] => {
  const hybridResults = searchHybridProducts(catalogService.getAllHybridProducts(), query);
  return hybridResults.map(p => ({
    ...p,
    name: p.englishName,
    transliteration: p.aliases[p.aliases.length - 1] || '',
    defaultUnit: p.defaultUnit as Unit,
    price: p.shopPrice || p.price || 0,
    inStock: p.inventory ? p.inventory.available && p.inventory.stock > 0 : true
  }));
};

export const getProductsByCategory = (category: Category): Product[] => {
  const hybridResults = getHybridProductsByCategory(catalogService.getAllHybridProducts(), category);
  return hybridResults.map(p => ({
    ...p,
    name: p.englishName,
    transliteration: p.aliases[p.aliases.length - 1] || '',
    defaultUnit: p.defaultUnit as Unit,
    price: p.shopPrice || p.price || 0,
    inStock: p.inventory ? p.inventory.available && p.inventory.stock > 0 : true
  }));
};
