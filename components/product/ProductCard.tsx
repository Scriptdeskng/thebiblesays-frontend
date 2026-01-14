'use client';

import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { accessToken } = useAuthStore();
  const { currency } = useCurrencyStore();
  const productIdString = product.id.toString();
  const isFavorite = isInWishlist(productIdString);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      product,
      quantity: 1,
      color: product.colors[0]?.name || 'default',
      size: product.sizes[0] || 'M',
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleItem(productIdString, accessToken || undefined);
  };

  return (
    <Link href={`/shop/${product.slug}`}>
      <div
        className="group relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-accent-1">
          <Image
            src={product.images[0]?.url || '/placeholder.png'}
            alt={product.images[0]?.alt || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-accent-1 transition-colors z-10"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite ? "fill-primary text-primary" : "text-grey"
              )}
            />
          </button>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 hidden md:block p-4 bg-linear-to-t from-black/60 to-transparent",
              "transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
            )}
          >
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
            >
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="py-4 transition-all duration-200 ease-linear md:group-hover:px-4">
          <h3 className="text-primary my-3 line-clamp-1 sm:my-5">
            {product.name}
          </h3>
          <div className='flex items-center gap-4'>
            <div className="sm:flex flex-col gap-2 hidden">
              {product.inStock ? (
                <Badge variant="success" className='bg-white border border-[#E6E7E8] text-primary'>In Stock</Badge>
              ) : (
                <Badge variant="danger" className='bg-white border border-[#E6E7E8] text-primary'>Out of Stock</Badge>
              )}
            </div>

            <p className="text-sm font-medium sm:text-base text-[#474B57]">
              {formatPrice(product.price, currency)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};