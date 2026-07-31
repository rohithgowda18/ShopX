import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import { PRODUCTS } from '../../data/products';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopOrders() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // For this simplified version, we assume the shop owner has only 1 shop, and the shop ID is their user ID.
  // In a real app, we'd query the shop document to get the shop ID.
  const shopId = userProfile?.id;

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orderList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      orderList.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching shop orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-4 text-center dark:text-gray-400">Loading orders...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3 border-b dark:border-gray-700 pb-3">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerName || 'Customer'} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <span className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold uppercase">{order.status}</span>
              </div>
              
              <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl transition-colors">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      <span className="font-medium text-gray-800 dark:text-white capitalize">{item.name}</span>
                      {(() => {
                        const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
                        return product ? <span className="ml-2 text-gray-600 dark:text-gray-300 font-bold">{product.kannadaName}</span> : null;
                      })()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'accepted')}
                    className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-xl text-sm hover:bg-blue-700"
                  >
                    Accept Order
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'packing')}
                    className="flex-1 bg-orange-600 text-white font-medium py-2 rounded-xl text-sm hover:bg-orange-700"
                  >
                    Start Packing
                  </button>
                )}
                {order.status === 'packing' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                    className="flex-1 bg-green-600 text-white font-medium py-2 rounded-xl text-sm hover:bg-green-700"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    className="flex-1 bg-green-800 text-white font-medium py-2 rounded-xl text-sm hover:bg-green-900"
                  >
                    Delivered
                  </button>
                )}
                {['pending', 'accepted'].includes(order.status) && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    className="flex-none bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium px-4 py-2 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
