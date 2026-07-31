import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import SwipeableCartItem from '../../../../components/customer/SwipeableCartItem';
import { RippleButton } from '../../../../components/ui/RippleButton';
import { OrderItem, Unit } from '../../../../types';
import { PRODUCTS } from '../../../../data/products';

interface CartEditorProps {
  items: OrderItem[];
  totalPrice: number;
  onBack: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: (item: OrderItem) => void;
  onDownloadPDF: () => void;
  onShareWhatsApp: () => void;
  onSendOrder: () => void;
}

export default function CartEditor({
  items,
  totalPrice,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
  onDownloadPDF,
  onShareWhatsApp,
  onSendOrder,
}: CartEditorProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 safe-area-pb">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center shadow-sm z-10 sticky top-0">
        <button onClick={onBack} className="p-2 mr-2 bg-gray-100 dark:bg-gray-700 rounded-full active:scale-95 min-h-touch min-w-touch flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty.</p>
            <button onClick={onBack} className="mt-6 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-6 py-3 rounded-xl min-h-touch">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <SwipeableCartItem
                key={idx}
                item={item}
                index={idx}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span> You might also need
            </h3>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {PRODUCTS.filter(p => !items.some(i => i.name === p.englishName)).slice(0, 5).map(product => (
                <div key={product.id} className="snap-start shrink-0 w-32 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                  <div className="text-3xl mb-2">{product.image}</div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1">{product.englishName}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight mb-1">{product.kannadaName}</p>
                  <p className="text-xs text-gray-500 mb-2">₹{product.price}/{product.defaultUnit}</p>
                  <RippleButton
                    onClick={() => onAddItem({ name: product.englishName, quantity: 1, unit: product.defaultUnit as Unit })}
                    className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold py-1.5 rounded-lg text-xs min-h-touch flex items-center justify-center"
                  >
                    Add
                  </RippleButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-[68px] left-0 right-0 sm:max-w-md sm:mx-auto bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Estimated Total</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{Math.round(totalPrice)}</span>
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={onDownloadPDF}
              className="flex-1 bg-white text-gray-800 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-all text-sm sm:text-base min-h-touch"
            >
              📄 Download PDF
            </button>
            <button
              onClick={onShareWhatsApp}
              className="flex-1 bg-[#25D366] text-white font-bold py-3 rounded-2xl hover:bg-[#20b958] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-all text-sm sm:text-base min-h-touch"
            >
              📱 Share on WhatsApp
            </button>
          </div>
          <button
            onClick={onSendOrder}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all text-lg min-h-touch"
          >
            Send Order to Shop
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
