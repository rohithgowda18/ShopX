import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Store, MapPin, ChevronRight, Check } from 'lucide-react';
import { Shop, OrderItem } from '../../types';
import { toast } from 'sonner';

export default function SelectShop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const items = location.state?.items as OrderItem[] || [];

  useEffect(() => {
    if (items.length === 0) {
      navigate('/customer/create-list');
      return;
    }

    const fetchShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'shops'));
        const shopList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
        // Mock some shops if empty for demo purposes
        if (shopList.length === 0) {
          const mockShops: Shop[] = [
            { id: '1', ownerId: 'demo', name: 'Shri Krishna Stores', address: 'Main Road, 1st Cross', phone: '9876543210', isOpen: true },
            { id: '2', ownerId: 'demo2', name: 'Lakshmi Provision Store', address: 'Market Road', phone: '9876543211', isOpen: true }
          ];
          setShops(mockShops);
        } else {
          setShops(shopList);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [items, navigate]);

  const handlePlaceOrder = async (shop: Shop) => {
    if (!userProfile) return;
    setPlacingOrder(true);
    try {
      const newOrder = {
        customerId: userProfile.id,
        customerName: userProfile.name,
        shopId: shop.id,
        items,
        status: 'pending',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'orders'), newOrder);
      toast.success('Order sent successfully!');
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to send order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="p-4 text-center dark:text-gray-400">Loading shops...</div>;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Select Shop</h2>
        <p className="text-gray-500 dark:text-gray-400">Where do you want to send this list?</p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-100 dark:border-green-900 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2 text-green-800 dark:text-green-400">
          <Check className="w-5 h-5" />
          <span className="font-medium">{items.length} items ready to order</span>
        </div>
      </div>

      <div className="space-y-3">
        {shops.map(shop => (
          <button
            key={shop.id}
            onClick={() => handlePlaceOrder(shop)}
            disabled={placingOrder || !shop.isOpen}
            className={`w-full text-left bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border ${
              shop.isOpen ? 'border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500' : 'border-gray-100 dark:border-gray-700 opacity-60'
            } transition-all`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  shop.isOpen ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Store className={`w-5 h-5 ${shop.isOpen ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{shop.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{shop.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {shop.isOpen ? (
                  <>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md mb-2">OPEN</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </>
                ) : (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md">CLOSED</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
