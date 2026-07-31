import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { PRODUCTS } from '../../data/products';
import { Clock, CheckCircle, Package, AlertCircle, ShoppingBag, RotateCcw } from 'lucide-react';
import { Card, Badge, Button, Skeleton } from '../../components/ui/DesignSystem';
import { useNavigate } from 'react-router';

export default function CustomerOrders() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
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
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted':
      case 'packing': return <Package className="w-4 h-4" />;
      case 'ready':
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted':
      case 'packing': return 'info';
      case 'ready':
      case 'delivered': return 'success';
      default: return 'danger';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-emerald-600" /> Your Orders
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Track and reorder your past Kirana purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
            When you place an order with a local shop, it will appear here.
          </p>
          <Button onClick={() => navigate('/customer/create-list')} variant="primary">
            Create Shopping List
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="p-4 md:p-5">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Badge variant={getBadgeVariant(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.slice(0, 4).map((item, idx) => {
                  const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                        {product && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-700/60 px-1.5 py-0.5 rounded">
                            {product.kannadaName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  );
                })}
                {order.items.length > 4 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-1 font-medium">
                    +{order.items.length - 4} more items
                  </p>
                )}
              </div>

              {order.status === 'delivered' && (
                <Button
                  onClick={() => navigate('/customer/create-list', { state: { items: order.items } })}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" /> Reorder List
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
