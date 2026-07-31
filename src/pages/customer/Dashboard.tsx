import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ListPlus, Mic, Camera, Clock, Package, CheckCircle, AlertCircle, ShoppingBag, Store, RotateCcw, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order } from '../../types';
import { CATEGORIES, PRODUCTS } from '../../data/products';
import ProductCard from '../../components/customer/ProductCard';
import QuantityBottomSheet from '../../components/customer/QuantityBottomSheet';
import SearchBar from '../../components/customer/SearchBar';
import { Product } from '../../data/types';

export default function CustomerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
      setRecentOrders(orderList.slice(0, 3));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'accepted':
      case 'packing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'ready':
      case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'accepted':
      case 'packing': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'ready':
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    }
  };

  const buyAgainProducts = PRODUCTS.slice(0, 4);
  const popularProducts = PRODUCTS.filter(p => p.popular).slice(0, 4);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header & Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Namaskara, {userProfile?.name || 'Customer'} 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Smart local Kirana grocery shopping
          </p>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md py-1 -mx-4 px-4 md:mx-0 md:px-0">
        <SearchBar
          query={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            if (q) navigate(`/customer/create-list`);
          }}
          onVoiceClick={() => navigate('/customer/create-list?mode=voice')}
          onCameraClick={() => navigate('/customer/create-list?mode=scan')}
        />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/customer/create-list')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-95 min-h-touch"
        >
          <ListPlus className="w-6 h-6" />
          <span className="font-bold text-xs">Manual List</span>
        </button>

        <button
          onClick={() => navigate('/customer/create-list?mode=voice')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-95 min-h-touch"
        >
          <Mic className="w-6 h-6" />
          <span className="font-bold text-xs">Voice Input</span>
        </button>

        <button
          onClick={() => navigate('/customer/create-list?mode=scan')}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-95 min-h-touch"
        >
          <Camera className="w-6 h-6" />
          <span className="font-bold text-xs">Scan List</span>
        </button>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols on Desktop): Recent Orders & Buy Again */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" /> Recent Orders
              </h3>
              <button 
                onClick={() => navigate('/customer/orders')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 min-h-touch"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-gray-400">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs font-medium">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800 dark:text-white">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)} flex items-center gap-1 uppercase`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {order.items.map(i => i.name).join(', ')}
                    </p>

                    <div className="flex justify-between items-center pt-1 text-xs border-t border-gray-200/50 dark:border-gray-600/50">
                      <span className="text-gray-500 dark:text-gray-400">{order.items.length} Items</span>
                      <button
                        onClick={() => navigate('/customer/create-list', { state: { items: order.items } })}
                        className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline min-h-touch"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buy Again Carousel */}
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-3">❤️ Buy Again</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {buyAgainProducts.map(product => (
                <ProductCard key={product.id} product={product} onAdd={(p) => setSelectedProduct(p)} />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col on Desktop): Categories & Popular */}
        <div className="space-y-6">
          
          {/* Categories Grid */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Popular Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.slice(0, 6).map(cat => (
                <button
                  key={cat.name}
                  onClick={() => navigate('/customer/create-list')}
                  className="flex items-center space-x-2 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left min-h-touch"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended / Popular Items */}
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-3">⭐ Popular Products</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularProducts.slice(0, 2).map(product => (
                <ProductCard key={product.id} product={product} onAdd={(p) => setSelectedProduct(p)} />
              ))}
            </div>
          </div>

        </div>

      </div>

      {selectedProduct && (
        <QuantityBottomSheet
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(product, qty, unit) => {
            navigate('/customer/create-list', { state: { items: [{ name: product.englishName, quantity: qty, unit }] } });
          }}
        />
      )}
    </div>
  );
}
