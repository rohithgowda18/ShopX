import React from 'react';
import { Category } from '../../data/products';

interface CategoryCardProps { key?: React.Key | string | number;
  category: { name: Category; icon: string };
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-3xl min-w-[100px] transition-all ${
        isSelected 
          ? 'bg-green-600 text-white shadow-md transform scale-105' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 active:scale-95'
      }`}
    >
      <span className="text-3xl mb-2">{category.icon}</span>
      <span className="text-xs font-bold text-center leading-tight whitespace-pre-wrap">{category.name}</span>
    </button>
  );
}
