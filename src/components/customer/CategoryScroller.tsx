import React from 'react';
import { Category } from '../../data/products';
import CategoryCard from './CategoryCard';

interface CategoryScrollerProps {
  categories: { name: Category; icon: string }[];
  selectedCategory: Category | 'All' | 'Popular';
  onSelect: (cat: Category | 'All' | 'Popular') => void;
}

export default function CategoryScroller({ categories, selectedCategory, onSelect }: CategoryScrollerProps) {
  return (
    <div className="w-full px-4 py-2 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent">
      <div className="flex overflow-x-auto gap-3 snap-x scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <CategoryCard
          category={{ name: 'Popular' as Category, icon: '🔥' }}
          isSelected={selectedCategory === 'Popular'}
          onClick={() => onSelect('Popular')}
        />
        {categories.map(cat => (
          <CategoryCard
            key={cat.name}
            category={cat}
            isSelected={selectedCategory === cat.name}
            onClick={() => onSelect(cat.name)}
          />
        ))}
        <CategoryCard
          category={{ name: 'All' as Category, icon: '📦' }}
          isSelected={selectedCategory === 'All'}
          onClick={() => onSelect('All')}
        />
      </div>
    </div>
  );
}
