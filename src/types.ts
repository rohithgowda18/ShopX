export type UserRole = 'customer' | 'shop_owner' | 'admin';
export type Language = 'en' | 'kn' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  address?: string;
  preferredLanguage: Language;
  favoriteShopId?: string;
  createdAt: number;
}

export type Unit = 'kg' | 'g' | 'litre' | 'ml' | 'packet' | 'piece' | 'dozen' | 'box';

export interface OrderItem {
  name: string;
  quantity: number;
  unit: Unit;
  available?: boolean;
  replacedWith?: string;
  price?: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  totalCost?: number;
  customerName?: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  price: number;
  unit: Unit;
  inStock: boolean;
  barcode?: string;
}
