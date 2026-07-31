import React, { useState, useEffect } from 'react';
import { CatalogProduct } from '../../catalog/types/productTypes';
import { catalogSyncService } from '../../services/catalogSyncService';
import { Search, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { searchHybridProducts } from '../../catalog/utils/searchProducts';
import { catalogService } from '../../catalog/services/catalogService';

export default function AdminCatalogManager() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await catalogSyncService.getMasterCatalogFromFirestore();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching master catalog:', error);
      toast.error('Failed to load master catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await catalogSyncService.syncMasterCatalogToFirestore();
      toast.success('Master catalog synced successfully');
      await fetchProducts();
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = searchHybridProducts(products as any, searchQuery) as any as CatalogProduct[];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Master Catalog</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-100 text-blue-700 p-2 rounded-xl hover:bg-blue-200 transition-colors"
          >
            <RefreshCw className={`w-6 h-6 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search master catalog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
        />
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.englishName} className="w-full h-full object-cover rounded-2xl" /> : product.image}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{product.englishName}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
