import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { OrderItem, Unit } from '../../types';
import { CATEGORIES, PRODUCTS, Category, Product, searchProducts, refreshProductsFromCatalog } from '../../data/products';
import SearchBar from '../../components/customer/SearchBar';
import ProductCard from '../../components/customer/ProductCard';
import QuantityBottomSheet from '../../components/customer/QuantityBottomSheet';
import FloatingCart from '../../components/customer/FloatingCart';
import { parseVoiceInput } from '../../utils/voiceParser';
import { useAuth } from '../../context/AuthContext';
import { catalogService } from '../../catalog/services/catalogService';
import { inventoryService } from '../../services/inventoryService';

import { useVoiceRecognition } from './create-list/hooks/useVoiceRecognition';
import { useImageParser } from './create-list/hooks/useImageParser';
import { useCartBuilder } from './create-list/hooks/useCartBuilder';
import { usePDFExport } from './create-list/hooks/usePDFExport';
import { useWhatsAppShare } from './create-list/hooks/useWhatsAppShare';

import VoiceRecorder from './create-list/components/VoiceRecorder';
import CameraCapture from './create-list/components/CameraCapture';
import CartEditor from './create-list/components/CartEditor';

export default function CreateList() {
  const { userProfile } = useAuth();
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = searchParams.get('mode');
  const [mode, setMode] = useState<'browse' | 'voice' | 'scan' | 'cart'>(
    modeParam === 'voice' ? 'voice' : modeParam === 'scan' ? 'scan' : 'browse'
  );

  const { items, addItem, addItems, removeItem, updateQuantity } = useCartBuilder();
  const { voiceText, setVoiceText, voiceLang, changeLanguage, isRecording, toggleRecording } = useVoiceRecognition();
  const { image, setImage, loading, handleImageCapture, processImage } = useImageParser();
  const { generatePDF } = usePDFExport();
  const { shareOnWhatsApp } = useWhatsAppShare();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | 'Popular'>('Popular');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(CATEGORIES[0].name);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoaded(false);
      try {
        await catalogService.initialize();
        const shopId = userProfile?.favoriteShopId;
        if (shopId) {
          const products = await inventoryService.getHybridProductsForShop(shopId);
          refreshProductsFromCatalog(products);
        } else {
          refreshProductsFromCatalog(catalogService.getAllHybridProducts());
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setProductsLoaded(true);
      }
    };
    loadProducts();
  }, [userProfile?.favoriteShopId]);

  const processVoiceText = async () => {
    if (!voiceText) return;
    try {
      console.log('[DEBUG Client] Sending raw voice transcript to server parsing engine:', voiceText);
      const response = await fetch('/api/gemini/parse-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceText })
      });

      const parsedItems = await response.json();
      console.log('[DEBUG Client] Received parsed items array from Gemini:', parsedItems);

      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        const newItems: OrderItem[] = parsedItems.map(pi => {
          console.log(`[DEBUG Client] Processing item: Name=${pi.name}, Qty=${pi.quantity}, Unit=${pi.unit}`);
          return {
            name: pi.name || 'Unknown Item',
            quantity: Number(pi.quantity) || 1,
            unit: (pi.unit || 'piece') as Unit,
          };
        });
        addItems(newItems);
        toast.success(`Successfully parsed ${newItems.length} items!`);
        setMode('cart');
      } else {
        toast.error('Could not recognize any items in voice input.');
      }
    } catch (error) {
      console.error('[DEBUG Client] Voice parser API error:', error);
      toast.error('Failed to connect to Indian grocery semantic parser');
    } finally {
      setVoiceText('');
      if (mode !== 'cart') setMode('browse');
    }
  };

  const handleProcessImage = async () => {
    const extracted = await processImage();
    if (extracted.length > 0) {
      addItems(extracted);
      setMode('cart');
    }
  };

  const filteredProducts = useMemo(() => {
    if (searchQuery) {
      return searchProducts(searchQuery);
    }
    if (selectedCategory === 'Popular') {
      return PRODUCTS.filter(p => p.popular);
    }
    if (selectedCategory === 'All') {
      return PRODUCTS;
    }
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [searchQuery, selectedCategory, productsLoaded]);

  const handleAddProduct = (product: Product, quantity: number, unit: string) => {
    addItem({ name: product.englishName, quantity, unit: unit as Unit });
    setSelectedProduct(null);
    toast.success(`Added ${quantity}${unit} ${product.englishName}`);
  };

  const totalPrice = items.reduce((acc, item) => {
    const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
    if (product) {
      const basePrice = product.price;
      const baseUnit = product.defaultUnit.toLowerCase();
      const currentUnit = item.unit.toLowerCase();
      let multiplier = 1;

      if (baseUnit === 'kg' && currentUnit === 'g') multiplier = 0.001;
      if (baseUnit === 'g' && currentUnit === 'kg') multiplier = 1000;
      if (baseUnit === 'litre' && currentUnit === 'ml') multiplier = 0.001;
      if (baseUnit === 'ml' && currentUnit === 'litre') multiplier = 1000;
      if (baseUnit === 'piece' && currentUnit === 'dozen') multiplier = 12;
      if (baseUnit === 'dozen' && currentUnit === 'piece') multiplier = 1/12;

      return acc + (basePrice * item.quantity * multiplier);
    }
    return acc;
  }, 0);

  if (mode === 'cart') {
    return (
      <CartEditor
        items={items}
        totalPrice={totalPrice}
        onBack={() => setMode('browse')}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onAddItem={addItem}
        onDownloadPDF={() => generatePDF(items)}
        onShareWhatsApp={() => shareOnWhatsApp(items)}
        onSendOrder={() => navigate('/customer/select-shop', { state: { items } })}
      />
    );
  }

  const buyAgainProducts = PRODUCTS.slice(0, 5);
  const monthlyProducts = PRODUCTS.slice(5, 10);
  const popularProducts = PRODUCTS.filter(p => p.popular);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="pt-6">
          <div className="px-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Namaskara 👋</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">What do you need today?</p>
          </div>

          <div className="px-4 mb-8 sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md py-2 -mx-4 pb-4">
            <div className="px-4">
              <SearchBar
                query={searchQuery}
                onChange={setSearchQuery}
                onVoiceClick={() => setMode('voice')}
                onCameraClick={() => setMode('scan')}
              />
            </div>
          </div>

          {searchQuery ? (
            <div className="px-4">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Search Results</h3>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-[32px]">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No products found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="px-4">
                <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">❤️ Buy Again</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Your recently purchased items</p>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {buyAgainProducts.map(product => (
                    <div key={product.id} className="snap-start shrink-0 w-40">
                      <ProductCard product={product} onAdd={(p) => setSelectedProduct(p)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">📦 Monthly Grocery</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your usual monthly essentials</p>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {monthlyProducts.map(product => (
                    <div key={product.id} className="snap-start shrink-0 w-40">
                      <ProductCard product={product} onAdd={(p) => setSelectedProduct(p)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">⭐ Popular</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Most ordered products</p>
                <div className="grid grid-cols-2 gap-4">
                  {popularProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </div>

              <div className="px-4 pb-8 space-y-4">
                {CATEGORIES.map(category => {
                  const categoryProducts = PRODUCTS.filter(p => p.category === category.name);
                  const isExpanded = expandedCategory === category.name;

                  return (
                    <div key={category.name} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                        className="w-full px-6 py-5 flex items-center justify-between bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{category.icon}</span>
                          <div className="text-left">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{category.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{categoryProducts.length} Products</p>
                          </div>
                        </div>
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-6 pt-2 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700">
                          {categoryProducts.map(product => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onAdd={(p) => setSelectedProduct(p)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {mode === 'voice' && (
          <VoiceRecorder
            isRecording={isRecording}
            voiceText={voiceText}
            voiceLang={voiceLang}
            loading={loading}
            onToggleRecording={toggleRecording}
            onChangeLanguage={changeLanguage}
            onTextChange={setVoiceText}
            onProcess={processVoiceText}
            onClose={() => setMode('browse')}
          />
        )}

        {mode === 'scan' && (
          <CameraCapture
            image={image}
            loading={loading}
            onImageCapture={handleImageCapture}
            onClearImage={() => setImage(null)}
            onProcess={handleProcessImage}
            onClose={() => setMode('browse')}
          />
        )}
      </div>

      {mode === 'browse' && (
        <div className="fixed left-0 right-0 sm:max-w-md sm:mx-auto z-30 transition-all bottom-4">
          <div className="px-4 mb-4">
            <FloatingCart
              itemCount={items.length}
              totalPrice={Math.round(totalPrice)}
              onClick={() => setMode('cart')}
              isMobileLayout={true}
            />
          </div>
        </div>
      )}

      {selectedProduct && (
        <QuantityBottomSheet
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}
