import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, CheckCircle, Clock, TrendingUp, Store, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order } from '../../types';
import { Card, Badge, Button, Skeleton } from '../../components/ui/DesignSystem';

export default function ShopOwnerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
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
      console.error('Error fetching dashboard orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const packingCount = orders.filter(o => o.status === 'accepted' || o.status === 'packing').length;
  const readyCount = orders.filter(o => o.status === 'ready' || o.status === 'delivered').length;

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-emerald-600" /> Shop Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            Welcome back, {userProfile?.name || 'Shop Owner'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/shop/import-products')} variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Pending</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{pendingCount}</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 mb-1">
            <Package className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Packing</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{packingCount}</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Ready</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{readyCount}</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Total Orders</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{orders.length}</span>
        </Card>
      </div>

      {/* Action / Today's Orders Section */}
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Recent Shop Orders</h3>
          <Button onClick={() => navigate('/shop/orders')} variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400">
            Manage All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No active orders. New customer orders will show here live.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <Badge variant={order.status === 'pending' ? 'warning' : 'info'}>{order.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {order.customerName || 'Customer'} • {order.items.length} items
                  </p>
                </div>
                <Button onClick={() => navigate('/shop/orders')} variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button onClick={() => navigate('/shop/products')} variant="secondary" className="w-full justify-center py-4">
        <Package className="w-5 h-5 mr-2" /> Manage Shop Inventory & Stock
      </Button>
    </div>
  );
}
