'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
}

interface ShopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isMobile?: boolean;
}

// Manual predefined options
const categories = ['Shirts', 'Caps', 'Hoodie', 'Headband', 'Hat', 'Jackets', 'Polo', 'Sweat-shirt'];

const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Light Blue', hex: '#ADD8E6' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Beige', hex: '#F5F5DC' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '14', '18', '25'];

// Fixed price range
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const PRICE_STEP = 5000;

export const ShopFilters = ({ filters, onChange, isMobile = false }: ShopFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onChange({ ...filters, colors: newColors });
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: newSizes });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-primary mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 rounded border-accent-2 text-primary focus:ring-primary"
              />
              <span className="text-grey capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all relative",
                filters.colors.includes(color.name) ? "border-primary scale-110" : "border-accent-2"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {filters.colors.includes(color.name) && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-3">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "px-4 py-2 border rounded-md font-medium transition-all text-sm",
                filters.sizes.includes(size)
                  ? "border-primary bg-primary text-white"
                  : "border-accent-2 text-grey hover:border-primary"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={PRICE_STEP}
            value={filters.priceRange[1]}
            onChange={(e) => onChange({ 
              ...filters, 
              priceRange: [MIN_PRICE, parseInt(e.target.value)] 
            })}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between text-sm text-grey">
            <span>₦{MIN_PRICE.toLocaleString()}</span>
            <span>₦{filters.priceRange[1].toLocaleString()}</span>
          </div>
          <div className="text-xs text-grey text-center">
            Showing products up to ₦{filters.priceRange[1].toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Filters
        </Button>

        {isOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
              <div className="sticky top-0 bg-white border-b border-accent-2 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Filters & Sort</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent-1 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <FilterContent />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-accent-2 p-6">
                <Button onClick={() => setIsOpen(false)} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-white border border-accent-2 rounded-lg p-6">
      <h2 className="text-lg font-bold text-primary mb-6">Filters</h2>
      <FilterContent />
    </div>
  );
};