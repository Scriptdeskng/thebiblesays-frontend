'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from "@/utils/cn";
import { Search, X } from "lucide-react";
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import { formatPrice } from '@/utils/format';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function SearchInput({ className, icon, ...props }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const { currency } = useCurrencyStore();
  
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      const products = await productService.getProducts();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1);
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(finalQuery.trim())}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        router.push(`/product/${suggestions[highlightedIndex].id}`);
        setQuery('');
        setIsOpen(false);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-[#878A92] px-3 py-2",
          "focus-within:outline-none transition-colors",
          className
        )}
      >
        {icon ?? <Search className="w-5 h-5 text-grey" />}
        <input
          className="flex-1 bg-transparent outline-none placeholder:text-grey"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          {...props}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-accent-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-grey" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-accent-2 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent-1 transition-colors text-left",
                  highlightedIndex === index && "bg-accent-1"
                )}
              >
                <div className="relative w-12 h-12 bg-accent-1 rounded shrink-0">
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
                <p className="font-semibold text-primary">{formatPrice(product.price, currency)}</p>
              </button>
            ))}
          </div>

          <div className="border-t border-accent-2 p-3">
            <button
              onClick={() => handleSearch()}
              className="w-full text-center text-sm text-primary hover:underline font-medium"
            >
              View all results for "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}