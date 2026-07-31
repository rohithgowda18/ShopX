import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { catalogService } from '../../catalog/services/catalogService';
import { HybridProduct, ShopInventoryItem } from '../../catalog/types/productTypes';
import { saveShopInventoryItem } from '../../catalog/services/inventoryService';
import { searchHybridProducts } from '../../catalog/utils/searchProducts';

export default function ImportProducts() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const shopId = userProfile?.id;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<HybridProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<HybridProduct | null>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const all = catalogService.getAllHybridProducts();
      setResults(searchHybridProducts(all, searchQuery).slice(0, 20));
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !shopId) return;

    try {
      setSaving(true);
      const item: ShopInventoryItem = {
        productId: selectedProduct.id,
        shopId: shopId,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        available: true,
        lastUpdated: Date.now(),
        packSize: selectedProduct.defaultUnit
      };
      
      await saveShopInventoryItem(shopId, item);
      toast.success('Product imported to your inventory');
      setSelectedProduct(null);
      setPrice('');
      setStock('100');
    } catch (error) {
      toast.error('Failed to import product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Import Product</h2>
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

      {!selectedProduct ? (
        <div className="space-y-3">
          {results.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{product.englishName}</h3>
                <p className="text-sm font-bold text-gray-600">{product.kannadaName}</p>
                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
              </div>
              <button 
                onClick={() => setSelectedProduct(product)}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200"
              >
                Select
              </button>
            </div>
          ))}
          {searchQuery && results.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No products found in master catalog.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800">{selectedProduct.englishName}</h3>
            <p className="text-sm font-bold text-gray-600">{selectedProduct.kannadaName}</p>
            <p className="text-xs text-gray-500 mt-1">Default Unit: {selectedProduct.defaultUnit}</p>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Import'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
