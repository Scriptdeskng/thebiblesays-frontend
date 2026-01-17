'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import { formatPrice } from '@/utils/format';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['T-Shirt', 'Hoodie', 'Cap', 'Custom Merch'];

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { currency } = useCurrencyStore();

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      const products = await productService.getProducts();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      setSuggestions(filtered);
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const saveToRecent = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      saveToRecent(finalQuery.trim());
      router.push(`/shop?search=${encodeURIComponent(finalQuery.trim())}`);
      setQuery('');
      onClose();
    }
  };

  const handleProductClick = (product: Product) => {
    router.push(`/shop/${product.slug}`);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="sticky top-0 bg-white border-b border-accent-2 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-1 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-grey" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-md border border-accent-2 px-3 py-2">
            <Search className="w-5 h-5 text-grey" />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
              className="flex-1 bg-transparent outline-none placeholder:text-grey"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-accent-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-grey" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-80px)] pb-safe">
        {query.trim().length >= 2 && suggestions.length > 0 ? (
          <div className="p-5">
            <h3 className="text-sm font-semibold text-grey mb-3">Products</h3>
            <div className="space-y-2">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent-1 transition-colors text-left"
                >
                  <div className="relative w-14 h-14 bg-accent-1 rounded shrink-0">
                    <Image
                      src={product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary truncate">{product.name}</p>
                    <p className="text-sm text-grey">{product.category}</p>
                  </div>
                  <p className="font-semibold text-primary text-sm">{formatPrice(product.price, currency)}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSearch()}
              className="w-full mt-4 py-3 text-center text-primary font-medium border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              View all results for "{query}"
            </button>
          </div>
        ) : query.trim().length >= 2 && suggestions.length === 0 ? (
          <div className="p-5 text-center">
            <div className="w-20 h-20 bg-accent-1 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-grey" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No results found</h3>
            <p className="text-grey">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-grey">Recent Searches</h3>
                  <button
                    onClick={clearRecent}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-4 py-2 bg-accent-1 rounded-full text-sm text-primary hover:bg-accent-2 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-grey" />
                <h3 className="text-sm font-semibold text-grey">Popular Searches</h3>
              </div>
              <div className="space-y-2">
                {POPULAR_SEARCHES.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent-1 transition-colors text-left"
                  >
                    <Search className="w-5 h-5 text-grey" />
                    <span className="text-primary">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}