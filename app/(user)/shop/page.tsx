'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopFilters, FilterState } from '@/components/shop/ShopFilters';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types/product.types';
import { GrNext, GrPrevious } from 'react-icons/gr';
import { useRouter } from "next/navigation";
import { productService } from '@/services/product.service';

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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 1000000],
  });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await productService.getProducts();
        setProducts(fetchedProducts);
        
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        p.features.some(f => f.toLowerCase().includes(query))
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories.some(cat => 
          p.category.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(p.category.toLowerCase())
        )
      );
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors.some(c => 
          filters.colors.some(filterColor =>
            c.name.toLowerCase() === filterColor.toLowerCase()
          )
        )
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes.some(s => 
          filters.sizes.some(filterSize =>
            s.toString().toLowerCase() === filterSize.toString().toLowerCase()
          )
        )
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
  }, [filters, sortBy, searchQuery, products]);

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-accent-1" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-accent-1 rounded w-3/4" />
            <div className="h-4 bg-accent-1 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-[1536px] mx-auto px-5 py-8 sm:px-10 xl:px-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Shop</h1>
        {searchQuery && (
          <p className="text-grey">
            Search results for: <span className="font-semibold text-primary">"{searchQuery}"</span>
          </p>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <ShopFilters filters={filters} onChange={setFilters} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="lg:hidden">
              <ShopFilters filters={filters} onChange={setFilters} isMobile />
            </div>

            {!isLoading && (
              <div className="text-sm text-grey hidden lg:block">
                Showing {filteredProducts.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
              </div>
            )}

            <div className='flex flex-row gap-2 items-center'>
              <label className='text-sm text-grey hidden sm:block'>SORT BY:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-accent-2 rounded-md focus:outline-none"
                disabled={isLoading}
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

          {!isLoading && (
            <div className="text-sm text-grey mb-2 lg:hidden">
              Showing {filteredProducts.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
            </div>
          )}

          {(hasActiveFilters || searchQuery) && !isLoading && (
            <div className="mb-6 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => router.push('/shop')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
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

          {isLoading ? (
            <LoadingSkeleton />
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-grey text-lg mb-4">
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : 'No products found'}
              </p>
              {(hasActiveFilters || searchQuery) && (
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      colors: [],
                      sizes: [],
                      priceRange: [0, 1000000],
                    });
                    if (searchQuery) router.push('/shop');
                  }}
                  className="text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
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