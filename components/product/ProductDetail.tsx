'use client';

import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Product, Review, Size } from '@/types/product.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { FaStar } from 'react-icons/fa';
import { ReviewSection } from './ReviewSection';
import { useAuthStore } from '@/store/useAuthStore';

interface ProductDetailsProps {
  product: Product;
  reviews: Review[];
}

export const ProductDetails = ({ product, reviews }: ProductDetailsProps) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { accessToken } = useAuthStore();
  const productIdString = product.id.toString();
  const isFavorite = isInWishlist(productIdString);

  const currentImage = product.images.find(img => img.color === selectedColor) || product.images[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      product,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });
  };

  const handleToggleFavorite = async () => {
    await toggleItem(productIdString, accessToken || undefined);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="relative aspect-square bg-accent-1 rounded-lg overflow-hidden">
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-primary mb-3">{product.name}</h1>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-accent-1 px-4 rounded-full py-1">
            <div className="text-grey">
              <FaStar />
            </div>
            <span className="text-sm text-grey">
              {product.rating} - {product.reviewCount} reviews
            </span>
          </div>

          {product.inStock ? (
            <Badge variant="success">In Stock</Badge>
          ) : (
            <Badge variant="danger">Out of Stock</Badge>
          )}
        </div>

        <p className="text-xl font-bold text-primary mb-6">
          {formatPrice(product.price)}
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-primary mb-2 uppercase">Available Colors</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    selectedColor === color.name ? "border-primary scale-110" : "border-accent-2"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm text-primary mb-2 uppercase">Size</h3>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "px-4 py-2 border rounded-md font-medium transition-all",
                    selectedSize === size
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
            <h3 className="text-sm text-primary mb-2 uppercase">Quantity</h3>
            <div className="flex items-center gap-3 border border-accent-2 w-fit p-2 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-accent-1 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold min-w-[3ch] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-accent-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1"
              leftIcon={<ShoppingCart className="w-5 h-5 pr-1" />}
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className={cn(isFavorite && "bg-red-50 border-red-500")}
            >
              <Heart className={cn(
                "w-5 h-5 pr-1",
                isFavorite && "fill-red-500 text-red-500"
              )} />
            </Button>
          </div>
        </div>

        <div className="mt-8 border-t border-accent-2 pt-6">
          <div className="flex gap-4 border-b border-accent-2">
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                "pb-3 px-4 font-medium transition-colors relative",
                activeTab === 'description' ? "text-primary" : "text-grey"
              )}
            >
              Description
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "pb-3 px-4 font-medium transition-colors relative",
                activeTab === 'reviews' ? "text-primary" : "text-grey"
              )}
            >
              Reviews
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'description' ? (
              <div>
                <p className="text-grey mb-4">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-grey">
                      <span className="text-primary mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ReviewSection
                productId={product.id}
                reviews={reviews}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};