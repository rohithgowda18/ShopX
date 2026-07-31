import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ShopInventoryItem, HybridProduct } from '../../catalog/types/productTypes';
import { fetchShopInventory, updateInventoryStock } from '../../catalog/services/inventoryService';
import { catalogService } from '../../catalog/services/catalogService';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ShopProducts() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [inventory, setInventory] = useState<HybridProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const shopId = userProfile?.id;

  const loadInventory = async () => {
    if (!shopId) return;
    try {
      const items = await fetchShopInventory(shopId);
      catalogService.setShopInventory(items, shopId);
      const hybridItems = items.map(item => catalogService.getHybridProduct(item.productId)).filter(Boolean) as HybridProduct[];
      setInventory(hybridItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [shopId]);

  const toggleStock = async (product: HybridProduct) => {
    if (!shopId || !product.inventory) return;
    try {
      const newAvailable = !product.inventory.available;
      await updateInventoryStock(shopId, product.id, product.inventory.stock, newAvailable);
      loadInventory();
    } catch (error) {
      console.error('Error updating stock status:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!shopId || !window.confirm('Are you sure you want to delete this product from your inventory?')) return;
    try {
      await deleteDoc(doc(db, `shops/${shopId}/inventory`, productId));
      toast.success('Product removed from inventory');
      loadInventory();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to remove product');
    }
  };

  const filteredProducts = inventory.filter(p => 
    p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
        <button 
          onClick={() => navigate('/shop/import-products')}
          className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 px-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Import</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search your inventory..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No products found in your inventory.</p>
          <button 
            onClick={() => navigate('/shop/import-products')}
            className="bg-white border border-gray-200 text-gray-700 font-medium px-6 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            Import your first product
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (<md) */}
          <div className="space-y-3 md:hidden">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{product.englishName}</h3>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{product.kannadaName}</p>
                    </div>
                    <span className="font-bold text-green-700 dark:text-green-400">₹{product.shopPrice}/{product.defaultUnit}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">{product.category}</span>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className={`text-xs font-bold ${product.inventory?.available ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {product.inventory?.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={product.inventory?.available || false} 
                        onChange={() => toggleStock(product)} 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4 border-l pl-4 border-gray-100 dark:border-gray-700">
                  <button onClick={() => navigate(`/shop/import-products?edit=${product.id}`)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg min-h-touch min-w-touch flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg min-h-touch min-w-touch flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{product.englishName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">{product.kannadaName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ₹{product.shopPrice} / {product.defaultUnit}
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleStock(product)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          product.inventory?.available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {product.inventory?.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => navigate(`/shop/import-products?edit=${product.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg inline-flex items-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
