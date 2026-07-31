import { useState, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import { HybridProduct, Category } from '../types/productTypes';
import { getHybridProductsByCategory } from '../utils/searchProducts';

export const useCatalog = () => {
  const [products, setProducts] = useState<HybridProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initCatalog = async () => {
      try {
        await catalogService.initialize();
        if (mounted) {
          setProducts(catalogService.getAllHybridProducts());
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load catalog'));
          setLoading(false);
        }
      }
    };

    initCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const getProductsByCategory = (category: Category) => {
    return getHybridProductsByCategory(products, category);
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getProduct: catalogService.getHybridProduct.bind(catalogService)
  };
};
