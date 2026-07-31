import { useState } from 'react';
import { OrderItem, Unit } from '../../../../types';

export function useCartBuilder(initialItems: OrderItem[] = []) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);

  const addItem = (item: OrderItem) => {
    setItems(prev => [...prev, item]);
  };

  const addItems = (newItems: OrderItem[]) => {
    setItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    setItems(prev => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return {
    items,
    setItems,
    addItem,
    addItems,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
