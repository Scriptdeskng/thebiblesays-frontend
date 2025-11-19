'use client';

import { ProductDetails } from '@/components/product/ProductDetail';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Review } from '@/types/product.types';

export default function ProductPageClient({
  product,
  reviews,
  relatedProducts
}: {
  product: Product | null;
  reviews: Review[];
  relatedProducts: Product[];
}) {
  if (!product) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <p className="text-grey">Loading...</p>
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
