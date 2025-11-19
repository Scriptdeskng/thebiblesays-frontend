'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Category, Size } from '@/types/product.types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

export interface FilterState {
  categories: Category[];
  colors: string[];
  sizes: Size[];
  priceRange: [number, number];
}

interface ShopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isMobile?: boolean;
}

const categories: Category[] = ['Shirts', 'Caps', 'Hoodie', 'Headband', 'Hat', 'Jackets'];
const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Light Blue', hex: '#ADD8E6' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Grey', hex: '#808080' },
];
const sizes: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ShopFilters = ({ filters, onChange, isMobile = false }: ShopFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: Category) => {
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

  const toggleSize = (size: Size) => {
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
              <span className="text-grey">{category}</span>
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
                "w-7 h-7 rounded-full border-2 transition-all",
                filters.colors.includes(color.name) ? "border-primary scale-110" : "border-accent-2"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
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
                "px-4 py-2 border rounded-md font-medium transition-all",
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
            min="5000"
            max="1000000"
            step="5000"
            value={filters.priceRange[1]}
            onChange={(e) => onChange({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between text-sm text-grey">
            <span>₦{filters.priceRange[0].toLocaleString()}</span>
            <span>₦{filters.priceRange[1].toLocaleString()}</span>
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