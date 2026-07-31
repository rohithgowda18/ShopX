import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { PRODUCTS } from '../../data/products';
import { Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';

export default function CustomerOrders() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', userProfile.id)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orderList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // Sort manually since we might need composite index for orderBy with where
      orderList.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'accepted':
      case 'packing': return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready':
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>;
      case 'accepted': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Accepted</span>;
      case 'packing': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase">Packing</span>;
      case 'ready': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Ready</span>;
      case 'delivered': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Delivered</span>;
      default: return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
    }
  };

  if (loading) return <div className="p-4 text-center dark:text-gray-400">Loading orders...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3 border-b dark:border-gray-700 pb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="space-y-1 mb-3">
                {order.items.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                    <span>
                      <span className="capitalize text-gray-900 dark:text-white font-medium">{item.name}</span>
                      {(() => {
                        const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
                        return product ? <span className="ml-2 text-gray-800 dark:text-gray-200 font-bold">{product.kannadaName}</span> : null;
                      })()}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">{item.quantity} {item.unit}</span>
                  </p>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">+{order.items.length - 3} more items</p>
                )}
              </div>

              {order.status === 'delivered' && (
                <button className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium py-2 rounded-xl text-sm border border-green-200 dark:border-green-900 transition-colors">
                  Reorder List
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
