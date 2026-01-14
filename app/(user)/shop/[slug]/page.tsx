'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductDetails } from '@/components/product/ProductDetail';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Review } from '@/types/product.types';
import { productService } from '@/services/product.service';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, getCurrencyParam } = useCurrencyStore();

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      const currencyParam = getCurrencyParam();

      try {
        const fetchedProduct = await productService.getProductBySlug(slug, currencyParam);

        if (!fetchedProduct) {
          setError('Product not found');
          setIsLoading(false);
          return;
        }

        setProduct(fetchedProduct);

        const [fetchedReviews, fetchedRelated] = await Promise.all([
          productService.getReviews(fetchedProduct.id),
          productService.getRelatedProducts(fetchedProduct.id, 4, currencyParam)
        ]);

        setReviews(fetchedReviews);
        setRelatedProducts(fetchedRelated);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();

  }, [slug, currency]);

  if (isLoading) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-accent-1 rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-accent-1 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-accent-1 rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-accent-1 rounded w-1/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-accent-1 rounded animate-pulse" />
              <div className="h-4 bg-accent-1 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-accent-1 rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-primary mb-3">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-grey mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <ProductDetails product={product} reviews={reviews} />

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-primary mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}