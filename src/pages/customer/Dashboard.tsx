import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ListPlus, Mic, Camera, Clock, Package, CheckCircle, AlertCircle, ShoppingBag, RotateCcw, Search, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order } from '../../types';
import { CATEGORIES, PRODUCTS } from '../../data/products';
import ProductCard from '../../components/customer/ProductCard';
import QuantityBottomSheet from '../../components/customer/QuantityBottomSheet';
import SearchBar from '../../components/customer/SearchBar';
import { Product } from '../../data/types';
import { Card, Badge, Button, Skeleton } from '../../components/ui/DesignSystem';
import InstallAppButton from '../../components/ui/InstallAppButton';

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

  const buyAgainProducts = PRODUCTS.slice(0, 4);
  const monthlyProducts = PRODUCTS.slice(4, 8);
  const popularProducts = PRODUCTS.filter(p => p.popular).slice(0, 4);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-28">
      {/* 1. Hero Greeting Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-teal-950 p-6 rounded-3xl text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
          What do you need today? 🛒
        </h1>
        <p className="text-emerald-100 text-sm md:text-base font-medium">
          Namaskara, {userProfile?.name || 'Friend'}! Your trusted local Kirana assistant is ready.
        </p>
      </div>

      {/* 2. Hero Search Bar */}
      <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md py-2 -mx-4 px-4 md:mx-0 md:px-0">
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


      {/* 3. Primary User Action Cards with Friendly Indian Household Context */}
      <div>
        <h2 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Grocery Entry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => navigate('/customer/create-list?mode=voice')}
            className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all active:scale-[0.98] text-left group min-h-touch"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Speak Grocery List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Kannada, English & Hindi</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            onClick={() => navigate('/customer/create-list?mode=scan')}
            className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all active:scale-[0.98] text-left group min-h-touch"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Scan Written List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Photo of paper note</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </button>

          <button
            onClick={() => navigate('/customer/create-list')}
            className="bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-200 dark:border-sky-800 p-4 rounded-2xl flex items-center justify-between hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all active:scale-[0.98] text-left group min-h-touch"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ListPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Type Grocery List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manual item picker</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </button>
        </div>
      </div>

      {/* 4. Recent Orders Bar */}
      {recentOrders.length > 0 && (
        <Card className="p-4 md:p-5 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> Active Recent Orders
            </h2>
            <button
              onClick={() => navigate('/customer/orders')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 min-h-touch"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentOrders.map(order => (
              <div key={order.id} className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">#{order.id.slice(-6).toUpperCase()}</span>
                    <Badge variant={getBadgeVariant(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                    {order.items.map(i => i.name).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/customer/create-list', { state: { items: order.items } })}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 min-h-touch pt-1 border-t border-gray-100 dark:border-gray-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reorder Items
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. Buy Again Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-extrabold text-lg md:text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Buy Again
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your usual household items</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {buyAgainProducts.map(product => (
            <ProductCard key={product.id} product={product} onAdd={(p) => setSelectedProduct(p)} />
          ))}
        </div>
      </div>

      {/* 6. Popular Household Categories */}
      <Card className="p-4 md:p-5">
        <h2 className="font-extrabold text-lg text-gray-900 dark:text-white mb-3">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat.name}
              onClick={() => navigate('/customer/create-list')}
              className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl transition-all border border-gray-100 dark:border-gray-700 min-h-touch"
            >
              <span className="text-3xl mb-1">{cat.icon}</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 7. Recommended Products */}
      <div>
        <h2 className="font-extrabold text-lg md:text-xl text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Recommended For You
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {popularProducts.map(product => (
            <ProductCard key={product.id} product={product} onAdd={(p) => setSelectedProduct(p)} />
          ))}
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
