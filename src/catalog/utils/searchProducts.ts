import { HybridProduct, Category } from '../types/productTypes';

export const searchHybridProducts = (products: HybridProduct[], query: string): HybridProduct[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return products;

  const exactMatches: HybridProduct[] = [];
  const partialMatches: HybridProduct[] = [];
  const aliasMatches: HybridProduct[] = [];

  products.forEach(product => {
    const engName = product.englishName.toLowerCase();
    const kanName = product.kannadaName.toLowerCase();
    
    if (engName === normalizedQuery || kanName === normalizedQuery) {
      exactMatches.push(product);
      return;
    }

    if (engName.includes(normalizedQuery) || kanName.includes(normalizedQuery)) {
      partialMatches.push(product);
      return;
    }

    if (product.aliases && product.aliases.some(alias => alias.toLowerCase().includes(normalizedQuery))) {
      aliasMatches.push(product);
      return;
    }
  });

  return Array.from(new Set([...exactMatches, ...partialMatches, ...aliasMatches]));
};

export const getHybridProductsByCategory = (products: HybridProduct[], category: Category): HybridProduct[] => {
  return products.filter(p => p.category === category);
};
