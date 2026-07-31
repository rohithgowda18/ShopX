import { RippleButton } from "../ui/RippleButton";
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Product } from '../../data/products';

interface QuantityBottomSheetProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, unit: string) => void;
}

const getStorageKey = (id: string) => `kirana_last_qty_${id}`;

const getValidUnits = (defaultUnit: string) => {
  switch(defaultUnit.toLowerCase()) {
    case 'kg': return ['kg', 'g'];
    case 'g': return ['kg', 'g'];
    case 'litre': return ['litre', 'ml'];
    case 'ml': return ['litre', 'ml'];
    case 'packet': return ['packet'];
    case 'piece': return ['piece', 'dozen'];
    case 'dozen': return ['piece', 'dozen'];
    default: return [defaultUnit.toLowerCase()];
  }
};

const getStepAndChips = (currentUnit: string) => {
  switch(currentUnit.toLowerCase()) {
    case 'kg': return { step: 0.5, chips: [1, 2, 5, 10, 25], showUnit: true };
    case 'g': return { step: 100, chips: [100, 250, 500, 1000, 5000], showUnit: true };
    case 'litre': return { step: 0.5, chips: [1, 2, 5], showUnit: true };
    case 'ml': return { step: 100, chips: [200, 500, 1000], showUnit: true };
    case 'packet': return { step: 1, chips: [1, 2, 5, 10], showUnit: false };
    case 'piece': return { step: 1, chips: [1, 2, 6, 12], showUnit: false };
    case 'dozen': return { step: 1, chips: [1, 2, 5], showUnit: false };
    default: return { step: 1, chips: [1, 2, 5], showUnit: false };
  }
};

export default function QuantityBottomSheet({ product, onClose, onAdd }: QuantityBottomSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<string>('');
  const [inputVal, setInputVal] = useState('1');
  const [animatingQty, setAnimatingQty] = useState(false);
  const [animatingPrice, setAnimatingPrice] = useState(false);

  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem(getStorageKey(product.id));
      if (stored) {
        try {
          const { quantity: sq, unit: su } = JSON.parse(stored);
          setQuantity(sq);
          setUnit(su);
          setInputVal(sq.toString());
          return;
        } catch (e) {}
      }
      setQuantity(1);
      setInputVal('1');
      setUnit(product.defaultUnit.toLowerCase());
    }
  }, [product]);

  const calcTotal = (qty: number, currentUnit: string, prod: Product) => {
    const basePrice = prod.price;
    const baseUnit = prod.defaultUnit.toLowerCase();
    let multiplier = 1;
    
    if (baseUnit === 'kg' && currentUnit === 'g') multiplier = 0.001;
    if (baseUnit === 'g' && currentUnit === 'kg') multiplier = 1000;
    if (baseUnit === 'litre' && currentUnit === 'ml') multiplier = 0.001;
    if (baseUnit === 'ml' && currentUnit === 'litre') multiplier = 1000;
    if (baseUnit === 'piece' && currentUnit === 'dozen') multiplier = 12;
    if (baseUnit === 'dozen' && currentUnit === 'piece') multiplier = 1/12;
    
    return basePrice * qty * multiplier;
  };

  const estimatedTotal = product && unit ? calcTotal(quantity, unit, product) : 0;

  useEffect(() => {
    setAnimatingPrice(true);
    const t = setTimeout(() => setAnimatingPrice(false), 150);
    return () => clearTimeout(t);
  }, [estimatedTotal]);

  if (!product) return null;

  const validUnits = getValidUnits(product.defaultUnit);
  const { step, chips, showUnit } = getStepAndChips(unit);

  const handleQuantityChange = (newQty: number) => {
    if (newQty <= 0) return;
    setQuantity(newQty);
    setInputVal(newQty.toString());
    setAnimatingQty(true);
    setTimeout(() => setAnimatingQty(false), 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      setQuantity(val);
      setAnimatingQty(true);
      setTimeout(() => setAnimatingQty(false), 150);
    }
  };

  const increment = () => handleQuantityChange(quantity + step);
  const decrement = () => handleQuantityChange(Math.max(step, quantity - step));

  const handleAdd = () => {
    localStorage.setItem(getStorageKey(product.id), JSON.stringify({ quantity, unit }));
    onAdd(product, quantity, unit);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto bg-white dark:bg-gray-900 rounded-t-[32px] z-50 p-6 safe-area-pb animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 shrink-0" />
        
        <div className="flex flex-col items-center text-center mb-8 shrink-0 relative">
          <button onClick={onClose} className="absolute right-0 top-0 p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-transform shrink-0">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-[72px] mb-4 drop-shadow-sm leading-none">{product.image}</div>
          <h2 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">{product.englishName}</h2>
          <h3 className="text-[22px] font-bold text-gray-800 dark:text-gray-200 leading-tight mb-4">{product.kannadaName}</h3>
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
            <p className="text-green-700 dark:text-green-400 font-bold text-xl tracking-tight">₹{product.price} <span className="text-sm font-medium text-green-600/80 dark:text-green-400/80">/ {product.defaultUnit}</span></p>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[32px] p-6 mb-6 border border-gray-100 dark:border-gray-800 shrink-0">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 text-center tracking-wider uppercase">Quantity</p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <button 
              onClick={decrement}
              className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 active:scale-90 active:bg-gray-100 dark:active:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all hover:shadow-md"
            >
              <Minus className="w-8 h-8" />
            </button>
            
            <div className="relative flex flex-col items-center justify-center w-28">
              <input 
                type="number"
                value={inputVal}
                onChange={handleInputChange}
                className={`text-4xl font-bold text-gray-900 dark:text-white w-full text-center bg-transparent outline-none border-b-2 border-transparent focus:border-green-500 transition-all ${animatingQty ? 'scale-110 text-green-600 dark:text-green-400' : 'scale-100'}`}
              />
              <span className="text-gray-500 font-medium mt-1 text-lg">{unit}</span>
            </div>
            
            <button 
              onClick={increment}
              className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 active:scale-90 active:bg-gray-100 dark:active:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all hover:shadow-md"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {validUnits.map(u => (
              <button
                key={u}
                onClick={() => {
                  setUnit(u);
                  if (unit === 'kg' && u === 'g') handleQuantityChange(quantity * 1000);
                  else if (unit === 'g' && u === 'kg') handleQuantityChange(quantity / 1000);
                  else if (unit === 'litre' && u === 'ml') handleQuantityChange(quantity * 1000);
                  else if (unit === 'ml' && u === 'litre') handleQuantityChange(quantity / 1000);
                }}
                className={`px-6 py-3 min-w-[80px] rounded-2xl text-base font-bold transition-all ${
                  unit === u 
                    ? 'bg-green-600 text-white shadow-md scale-105' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Select */}
        <div className="mb-6 shrink-0">
          <div className="flex flex-wrap justify-center gap-3">
            {chips.map(c => (
              <button
                key={c}
                onClick={() => handleQuantityChange(c)}
                className={`px-5 py-3 rounded-2xl font-bold transition-all ${
                  quantity === c 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500 scale-105' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 active:scale-95 shadow-sm hover:bg-gray-50'
                }`}
              >
                {c}{showUnit ? (unit === 'litre' ? 'L' : unit) : ''}
              </button>
            ))}
          </div>
        </div>
        
        {/* Live Total & Add */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-2 pb-2 mt-auto shrink-0 z-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                ₹{product.price} × {quantity} {unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Total</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${animatingPrice ? 'text-green-500 scale-105' : 'text-green-600 dark:text-green-400'}`}>
                ₹{Math.round(estimatedTotal)}
              </p>
            </div>
          </div>
          <RippleButton
            onClick={handleAdd}
            className="w-full bg-green-600 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-green-700 active:scale-95 transition-transform text-xl flex justify-center items-center gap-2"
          >
            Add to Cart
          </RippleButton>
        </div>
      </div>
    </>
  );
}
