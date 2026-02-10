'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BYOMProduct } from '@/types/byom.types';
import { byomService } from '@/services/byom.service';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import toast from 'react-hot-toast';

export default function BYOMPage() {
  const { getCurrencyParam } = useCurrencyStore();
  const [products, setProducts] = useState<BYOMProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const currencyParam = getCurrencyParam();
        const productsList = await byomService.getAvailableProducts(currencyParam);
        setProducts(productsList);
      } catch (error) {
        toast.error('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [getCurrencyParam]);

  if (isLoading) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl lg:mb-4">
            Build Your Own Merch
          </h1>
          <p className="text-lg text-grey max-w-2xl">
            Design your own merch that reflects your story and beliefs. Add your favorite verse, phrase, or artwork - and make it yours
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border-2 border-accent-2 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-accent-1" />
              <div className="p-6">
                <div className="h-6 bg-accent-2 rounded mb-2" />
                <div className="h-4 bg-accent-2 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-10">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl lg:mb-4">
          Build Your Own Merch
        </h1>
        <p className="text-lg text-grey max-w-2xl">
          Design your own merch that reflects your story and beliefs. Add your favorite verse, phrase, or artwork - and make it yours
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-grey text-lg">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/byom/customize/${product.slug}`}
              className="group"
            >
              <div className="bg-white border-2 border-accent-2 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-accent-1 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full">
                      <Image
                        src={product.featured_image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-primary mb-1">{product.name}</h3>
                  <p className="text-grey text-sm mb-4">Customize your {product.name.toLowerCase()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}