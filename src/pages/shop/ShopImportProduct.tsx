import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CatalogProduct, ShopInventoryItem } from '../../catalog/types/productTypes';
import { catalogSyncService } from '../../services/catalogSyncService';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { searchHybridProducts } from '../../catalog/utils/searchProducts';

export default function ShopImportProduct() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMasterCatalog();
  }, []);

  const fetchMasterCatalog = async () => {
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

  const handleSave = async () => {
    if (!selectedProduct || !userProfile?.id) return;
    if (!price) {
      toast.error('Please enter a price');
      return;
    }

    try {
      setSaving(true);
      const inventoryItem: ShopInventoryItem = {
        productId: selectedProduct.id,
        shopId: userProfile.id,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        available: true,
        lastUpdated: Date.now()
      };
      await inventoryService.saveInventoryItem(inventoryItem);
      toast.success('Product imported successfully');
      setSelectedProduct(null);
      setPrice('');
      setStock('100');
    } catch (error) {
      console.error('Error importing product:', error);
      toast.error('Failed to import product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = searchHybridProducts(products as any, searchQuery) as any as CatalogProduct[];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Import Product</h2>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search catalog to import..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        />
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading catalog...</div>
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
                  <p className="text-sm text-gray-500">{product.kannadaName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(product)}
                className="bg-green-50 text-green-700 p-2 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Set Details</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl">
                {selectedProduct.image}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{selectedProduct.englishName}</h4>
                <p className="text-gray-500">{selectedProduct.kannadaName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter stock"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-6 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 active:bg-green-800 transition-all disabled:opacity-50"
            >
              {saving ? 'Importing...' : 'Import to Shop'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
