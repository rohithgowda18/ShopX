import React from 'react';
import { Product } from '../../data/products';
import { Plus } from 'lucide-react';

interface ProductCardProps { key?: React.Key | string | number;
  product: Product;
  onAdd: (product: Product) => void;
}

import { RippleButton } from '../ui/RippleButton';

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-all active:scale-95">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl">
          {(product as any).imageUrl ? <img src={(product as any).imageUrl} alt={product.name} className="w-full h-full object-cover rounded-2xl" /> : product.image}
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          ₹{product.price}
          <span className="text-xs text-gray-500 font-normal">/{product.defaultUnit}</span>
        </p>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{product.englishName}</h3>
        <p className="text-base font-bold text-gray-800 dark:text-gray-200">{product.kannadaName}</p>
        {product.brand && <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{product.brand}</p>}
      </div>
      <RippleButton
        onClick={() => onAdd(product)}
        className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add
      </RippleButton>
    </div>
  );
}
