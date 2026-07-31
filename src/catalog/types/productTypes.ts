export type Unit = 'kg' | 'g' | 'litre' | 'ml' | 'packet' | 'piece' | 'dozen' | 'box';

export type Category = 
  | 'Rice & Grains'
  | 'Millets'
  | 'Dals & Pulses'
  | 'Dairy & Eggs'
  | 'Oils & Ghee'
  | 'Salt, Sugar & Jaggery'
  | 'Masalas & Spices'
  | 'Vegetables'
  | 'Fruits'
  | 'Snacks & Biscuits'
  | 'Chocolates & Sweets'
  | 'Tea, Coffee & Beverages'
  | 'Instant Foods & Noodles'
  | 'Breakfast & Cereals'
  | 'Pickles, Sauces & Spreads'
  | 'Dry Fruits & Nuts'
  | 'Baking & Desserts'
  | 'Cleaning & Household'
  | 'Personal & Oral Care'
  | 'Baby Care'
  | 'Pet Care'
  | 'Health & OTC'
  | 'Pooja Needs'
  | 'Stationery & Electronics';

export interface CatalogProduct {
  id: string;
  englishName: string;
  kannadaName: string;
  brand?: string;
  category: Category;
  subcategory?: string;
  description?: string;
  image: string;
  imageUrl?: string;
  barcode?: string;
  aliases: string[];
  availableUnits: string[];
  defaultUnit: Unit;
  isPackaged: boolean;
  isLocalProduct: boolean;
  createdAt: number;
  updatedAt: number;
  // Compatibility fields
  price?: number; // fallback price if inventory is missing
  transliteration?: string;
  popular?: boolean;
}

export interface ShopInventoryItem {
  productId: string;
  shopId: string;
  price: number;
  offerPrice?: number;
  stock: number;
  available: boolean;
  preferredBrand?: string;
  packSize?: string;
  minimumOrder?: number;
  maximumOrder?: number;
  lastUpdated: number;
}

export interface HybridProduct extends CatalogProduct {
  inventory?: ShopInventoryItem;
  // Dynamic fields mapped from inventory
  shopPrice?: number;
}
