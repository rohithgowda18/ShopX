import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Store, Phone, MapPin, Save, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Shop } from '../../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export default function ShopSettings() {
  const { userProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      if (!userProfile) return;
      try {
        const q = query(collection(db, 'shops'), where('ownerId', '==', userProfile.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const shopData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Shop;
          setShop(shopData);
          setName(shopData.name);
          setPhone(shopData.phone);
          setAddress(shopData.address);
          setIsOpen(shopData.isOpen);
        }
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSaving(true);
    try {
      if (shop) {
        await updateDoc(doc(db, 'shops', shop.id), {
          name, phone, address, isOpen
        });
        toast.success('Shop settings updated');
      } else {
        const newShop = {
          ownerId: userProfile.id,
          name,
          phone,
          address,
          isOpen
        };
        await addDoc(collection(db, 'shops'), newShop);
        toast.success('Shop profile created');
      }
    } catch (error) {
      console.error('Error saving shop:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <div className="p-4 text-center dark:text-gray-400">Loading settings...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Shop Settings</h2>

      {/* Theme Preferences */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-4">Theme Preferences</p>
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Monitor className="w-4 h-4" />
            <span>Auto</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Store className="w-5 h-5" /></span>
            <input
              type="text"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 outline-none transition-all dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="w-5 h-5" /></span>
            <input
              type="tel"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 outline-none transition-all dark:text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MapPin className="w-5 h-5" /></span>
            <textarea
              required
              rows={3}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 outline-none transition-all dark:text-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Shop Open Status</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accepting new orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors mt-6 flex justify-center items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>

      <button 
        onClick={handleSignOut}
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}
