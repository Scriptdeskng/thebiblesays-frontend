'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product.types';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  bg?: string;
  link?: string;
  loading?: boolean;
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function ProductSection({
  title,
  subtitle,
  products,
  bg = "white",
  link = "/shop",
  loading = false,
}: ProductSectionProps) {
  return (
    <section className={`py-16 ${bg === "white" ? "bg-white" : ""}`}>
      <div className="max-w-[1536px] mx-auto px-4 sm:px-10 xl:px-20">
        <div className="flex items-center justify-between mb-8">
          <div className='mx-auto'>
            <p className="text-grey text-xs mb-2 text-center">{subtitle}</p>
            <h2 className="text-2xl text-center font-bold text-primary">{title}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        <div className="mt-6 text-center lg:mt-8">
          <Link href={link}>
            <Button variant="outline" disabled={loading}>
              View All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}