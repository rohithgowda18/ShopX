export interface OpenFoodFactsProduct {
  id: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  packaging?: string;
}

export const searchOpenFoodFacts = async (query: string): Promise<OpenFoodFactsProduct[]> => {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Error fetching from Open Food Facts:', err);
    return [];
  }
};

export const getByBarcode = async (barcode: string): Promise<OpenFoodFactsProduct | null> => {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();
    if (data.status === 1) {
      return data.product;
    }
    return null;
  } catch (err) {
    console.error('Error fetching by barcode:', err);
    return null;
  }
};
