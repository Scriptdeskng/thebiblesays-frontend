'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopFilters, FilterState } from '@/components/shop/ShopFilters';
import { Badge } from '@/components/ui/Badge';
import { mockProducts } from '@/lib/mockData';
import { Product } from '@/types/product.types';
import { GrNext, GrPrevious } from 'react-icons/gr';

type SortOption =
  | 'featured'
  | 'new-arrivals'
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

export default function ShopPage() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [5000, 1000000],
  });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors.some(c => filters.colors.includes(c.name))
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes.some(s => filters.sizes.includes(s))
      );
    }

    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    switch (sortBy) {
      case 'alphabetical-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabetical-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'new-arrivals':
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return filtered;
  }, [filters, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const clearFilter = (type: keyof FilterState, value?: any) => {
    if (type === 'categories') {
      setFilters({ ...filters, categories: filters.categories.filter(c => c !== value) });
    } else if (type === 'colors') {
      setFilters({ ...filters, colors: filters.colors.filter(c => c !== value) });
    } else if (type === 'sizes') {
      setFilters({ ...filters, sizes: filters.sizes.filter(s => s !== value) });
    }
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0;

  return (
    <div className="max-w-[1536px] mx-auto px-5 py-8 sm:px-10 xl:px-20">
      <h1 className="text-3xl font-bold text-primary mb-8">Shop</h1>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <ShopFilters filters={filters} onChange={setFilters} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="lg:hidden">
              <ShopFilters filters={filters} onChange={setFilters} isMobile />
            </div>

            <div className="text-sm text-grey hidden lg:block">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
            </div>

            <div className='flex flex-row gap-2 items-center'>
              <label className='text-sm text-grey hidden sm:block'>SORT BY:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-accent-2 rounded-md focus:outline-none"
              >
                <option value="featured">Featured Listings</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="alphabetical-asc">A-Z</option>
                <option value="alphabetical-desc">Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="date-asc">Date: Old to New</option>
                <option value="date-desc">Date: New to Old</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-grey mb-2 lg:hidden">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
          </div>

          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.categories.map(cat => (
                <Badge key={cat} className="flex items-center gap-1">
                  {cat}
                  <button onClick={() => clearFilter('categories', cat)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.colors.map(color => (
                <Badge key={color} className="flex items-center gap-1">
                  {color}
                  <button onClick={() => clearFilter('colors', color)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.sizes.map(size => (
                <Badge key={size} className="flex items-center gap-1">
                  {size}
                  <button onClick={() => clearFilter('sizes', size)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-grey text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2 xl:mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-accent-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-1"
                  >
                    <GrPrevious />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-md ${currentPage === i + 1
                        ? 'bg-primary text-white border-primary'
                        : 'border-accent-2 hover:bg-accent-1'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-accent-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-1"
                  >
                    <GrNext />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}