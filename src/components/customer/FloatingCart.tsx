import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface FloatingCartProps {
  itemCount: number;
  totalPrice: number;
  onClick: () => void;
  isMobileLayout?: boolean;
}

export default function FloatingCart({ itemCount, totalPrice, onClick, isMobileLayout }: FloatingCartProps) {
  if (itemCount === 0) return null;

  return (
    <div className={`z-30 animate-fade-in ${!isMobileLayout ? 'fixed bottom-20 left-4 right-4 sm:max-w-md sm:mx-auto' : 'w-full'}`}>
      <button 
        onClick={onClick}
        className="w-full bg-green-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between hover:bg-green-700 active:scale-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-500/50 p-2 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg">{itemCount} Items</p>
            <p className="text-green-100 text-sm font-medium">Est. Total: ₹{totalPrice}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-bold">
          Review
          <ArrowRight className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
}
