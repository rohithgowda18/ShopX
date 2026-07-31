import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Store, Phone, MapPin, Save, LogOut, Sun, Moon, Monitor, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Shop } from '../../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Card, Badge, Button, Skeleton } from '../../components/ui/DesignSystem';

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

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Store className="w-7 h-7 text-emerald-600" /> Shop Settings & Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Configure store info, operational status, and display options
        </p>
      </div>

      {/* Theme Preferences */}
      <Card className="p-4 md:p-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-3">Theme Preferences</p>
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'light' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'dark' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'system' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
          >
            <Monitor className="w-4 h-4 text-emerald-500" />
            <span>Auto</span>
          </button>
        </div>
      </Card>

      {/* Store Information Form */}
      <Card className="p-4 md:p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Shop Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Store className="w-5 h-5" /></span>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all text-sm dark:text-white"
                placeholder="E.g. Sri Lakshmi Kirana Stores"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Contact Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="w-5 h-5" /></span>
              <input
                type="tel"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all text-sm dark:text-white"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Store Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-gray-400"><MapPin className="w-5 h-5" /></span>
              <textarea
                required
                rows={3}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all text-sm dark:text-white resize-none"
                placeholder="Full address of your shop"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">Shop Open Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Accepting new customer orders online</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <Button type="submit" disabled={saving} variant="primary" className="w-full justify-center py-3.5">
            <Save className="w-5 h-5 mr-2" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </form>
      </Card>

      <Button onClick={handleSignOut} variant="danger" className="w-full justify-center">
        <LogOut className="w-5 h-5 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
