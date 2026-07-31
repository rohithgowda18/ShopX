import React, { useRef, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { OrderItem, Unit } from '../../types';
import { PRODUCTS } from '../../data/products';

interface SwipeableCartItemProps { key?: React.Key | string | number;
  item: OrderItem;
  index: number;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemove: (index: number) => void;
}

export default function SwipeableCartItem({ item, index, onUpdateQuantity, onRemove }: SwipeableCartItemProps) {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeThreshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Allow max swipe of 100px in either direction
    if (diff > 100) setOffsetX(100);
    else if (diff < -100) setOffsetX(-100);
    else setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offsetX > swipeThreshold) {
      // Swipe Right: Increase Quantity
      onUpdateQuantity(index, item.quantity + 1);
    } else if (offsetX < -swipeThreshold) {
      // Swipe Left: Delete
      onRemove(index);
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800 touch-pan-y">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
        <div className="flex items-center gap-2 text-green-600 font-bold">
          <Plus className="w-6 h-6" /> <span className="hidden sm:inline">Add</span>
        </div>
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <span className="hidden sm:inline">Delete</span> <Trash2 className="w-6 h-6" />
        </div>
      </div>

      {/* Foreground Card */}
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative z-10 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1">
          {(() => {
            const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
            return (
              <>
                <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight capitalize">{item.name}</p>
                {product && <p className="text-base font-bold text-gray-800 dark:text-gray-200">{product.kannadaName}</p>}
              </>
            );
          })()}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.quantity} {item.unit}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden min-h-[48px]">
            <button onClick={() => onUpdateQuantity(index, Math.max(0.5, item.quantity - 0.5))} className="p-3 active:bg-gray-200 dark:active:bg-gray-600">
              <Minus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-gray-900 dark:text-white">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(index, item.quantity + 0.5)} className="p-3 active:bg-gray-200 dark:active:bg-gray-600">
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <button 
            onClick={() => onRemove(index)}
            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl active:scale-95 transition-all hidden sm:block"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
