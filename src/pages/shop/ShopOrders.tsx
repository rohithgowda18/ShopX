import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import { PRODUCTS } from '../../data/products';
import { Package, Clock, CheckCircle, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, Skeleton } from '../../components/ui/DesignSystem';

export default function ShopOrders() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getBadgeVariant = (status: OrderStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted':
      case 'packing': return 'info';
      case 'ready':
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Store className="w-7 h-7 text-emerald-600" /> Manage Shop Orders
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Accept incoming customer requests and update fulfillment states
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Customer orders assigned to your shop will appear here in real-time.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="p-4 md:p-5">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {order.customerName || 'Customer'} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                {order.items.map((item, idx) => {
                  const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div key={idx} className="flex justify-between text-sm items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 dark:text-white capitalize">{item.name}</span>
                        {product && (
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {product.kannadaName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus(order.id, 'accepted')} variant="primary" className="flex-1">
                    Accept Order
                  </Button>
                )}
                {order.status === 'accepted' && (
                  <Button onClick={() => handleUpdateStatus(order.id, 'packing')} variant="primary" className="flex-1">
                    Start Packing
                  </Button>
                )}
                {order.status === 'packing' && (
                  <Button onClick={() => handleUpdateStatus(order.id, 'ready')} variant="primary" className="flex-1">
                    Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button onClick={() => handleUpdateStatus(order.id, 'delivered')} variant="primary" className="flex-1">
                    Mark Delivered
                  </Button>
                )}
                {['pending', 'accepted'].includes(order.status) && (
                  <Button onClick={() => handleUpdateStatus(order.id, 'cancelled')} variant="danger">
                    Reject Order
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
