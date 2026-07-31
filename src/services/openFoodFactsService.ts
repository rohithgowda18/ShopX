import { Category, Unit } from '../catalog/types/productTypes';

export interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  quantity?: string;
}

export class OpenFoodFactsService {
  private baseUrl = 'https://world.openfoodfacts.org/api/v2';
  private searchUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  async searchProducts(query: string): Promise<OFFProduct[]> {
    const url = `${this.searchUrl}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error("Open Food Facts search failed:", error);
      return [];
    }
  }

  async getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
    const url = `${this.baseUrl}/product/${barcode}.json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 1) {
        return data.product;
      }
      return null;
    } catch (error) {
      console.error("Open Food Facts barcode lookup failed:", error);
      return null;
    }
  }
}

export const openFoodFactsService = new OpenFoodFactsService();
