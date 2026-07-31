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

export interface Product {
  id: string;
  englishName: string;
  kannadaName: string;
  transliteration: string;
  aliases: string[];
  category: Category;
  price: number;
  defaultUnit: string;
  availableUnits: string[];
  image: string;
  brand?: string;
  popular?: boolean;
}

export const CATEGORIES: { name: Category; icon: string }[] = [
  { name: 'Rice & Grains', icon: '🌾' },
  { name: 'Millets', icon: '🌿' },
  { name: 'Dals & Pulses', icon: '🫘' },
  { name: 'Dairy & Eggs', icon: '🥛' },
  { name: 'Oils & Ghee', icon: '🛢' },
  { name: 'Salt, Sugar & Jaggery', icon: '🧂' },
  { name: 'Masalas & Spices', icon: '🌶' },
  { name: 'Vegetables', icon: '🍅' },
  { name: 'Fruits', icon: '🍎' },
  { name: 'Snacks & Biscuits', icon: '🍪' },
  { name: 'Chocolates & Sweets', icon: '🍫' },
  { name: 'Tea, Coffee & Beverages', icon: '☕' },
  { name: 'Instant Foods & Noodles', icon: '🍜' },
  { name: 'Breakfast & Cereals', icon: '🥣' },
  { name: 'Pickles, Sauces & Spreads', icon: '🥫' },
  { name: 'Dry Fruits & Nuts', icon: '🥜' },
  { name: 'Baking & Desserts', icon: '🧈' },
  { name: 'Cleaning & Household', icon: '🧼' },
  { name: 'Personal & Oral Care', icon: '🧴' },
  { name: 'Baby Care', icon: '👶' },
  { name: 'Pet Care', icon: '🐶' },
  { name: 'Health & OTC', icon: '💊' },
  { name: 'Pooja Needs', icon: '🕯' },
  { name: 'Stationery & Electronics', icon: '📚' }
];
