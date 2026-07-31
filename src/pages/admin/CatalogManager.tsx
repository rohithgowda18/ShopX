import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { CatalogProduct } from '../../catalog/types/productTypes';
import { fetchMasterCatalogFromFirestore, syncMasterCatalogToFirestore } from '../../catalog/services/catalogSyncService';
import { searchOpenFoodFacts } from '../../catalog/services/openFoodFactsService';

export default function CatalogManager() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const items = await fetchMasterCatalogFromFirestore();
      setProducts(items);
    } catch (e) {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSyncOFF = async () => {
    // A simplistic sync for demo: find some rice/dal from OFF and insert
    setSyncing(true);
    try {
      const results = await searchOpenFoodFacts('Aashirvaad');
      // map results to CatalogProduct
      const newProducts: CatalogProduct[] = results.filter(r => r.product_name).map(r => ({
        id: `off-${r.id}`,
        englishName: r.product_name,
        kannadaName: r.product_name, // fallback
        brand: r.brands || 'Unknown',
        category: 'Groceries' as any,
        image: r.image_url || '📦',
        barcode: r.id,
        aliases: [r.product_name],
        availableUnits: ['kg', 'g', 'packet'],
        defaultUnit: 'packet',
        isPackaged: true,
        isLocalProduct: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Filter duplicates based on ID
      const existingIds = new Set(products.map(p => p.id));
      const toInsert = newProducts.filter(p => !existingIds.has(p.id));

      if (toInsert.length > 0) {
        await syncMasterCatalogToFirestore(toInsert);
        toast.success(`Synced ${toInsert.length} new products from Open Food Facts`);
        loadProducts();
      } else {
        toast.info('No new products found to sync');
      }
    } catch (e) {
      toast.error('Failed to sync with Open Food Facts');
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kannadaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Master Catalog</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncOFF}
            disabled={syncing}
            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-medium text-sm">Sync OFF</span>
          </button>
          <button 
            className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 px-4"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline font-medium text-sm">Add New</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search master catalog..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Centralized Database</p>
          <p>These products are available for all shops to import. Editing a product here updates it globally.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {product.image.startsWith('http') ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : product.image}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {product.englishName}
                    {product.isLocalProduct && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Local</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{product.kannadaName}</p>
                  <p className="text-xs text-gray-400 mt-1">{product.category} • {product.brand || 'No Brand'}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4 border-l pl-4 border-gray-100">
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No products match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
