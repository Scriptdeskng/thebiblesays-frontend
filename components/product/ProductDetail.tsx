'use client';

import { useState, useEffect } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface ProductDetailsProps {
  product: Product;
  reviews: Review[];
}

export const ProductDetails = ({ product, reviews }: ProductDetailsProps) => {
  const [selectedColor, setSelectedColor] = useState(
    product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { currency } = useCurrencyStore();
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { accessToken } = useAuthStore();
  const productIdString = product.id.toString();
  const isFavorite = isInWishlist(productIdString);

  const isInCart = items.some(item => 
    (item.productId === product.id || item.productId === product.id.toString()) &&
    item.color === selectedColor &&
    item.size === selectedSize
  );

  const currentImage = product.images[currentImageIndex] || product.images[0];

  useEffect(() => {
    if (!isAutoPlaying || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, product.images.length]);

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

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
    setJustAdded(true);
  };

  const handleToggleFavorite = async () => {
    await toggleItem(productIdString, accessToken || undefined);
  };

  const handlePreviousImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <div className="relative aspect-square bg-accent-1 rounded-lg overflow-hidden mb-4 group">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            className="object-cover"
            priority
          />

          {product.images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>

              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>

              <div className="absolute top-3 right-3 flex gap-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      currentImageIndex === index 
                        ? "w-8 bg-white" 
                        : "w-1 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative w-20 h-20 bg-accent-1 rounded-md overflow-hidden shrink-0 border transition-all hover:border-primary/50",
                  currentImageIndex === index 
                    ? "border-primary" 
                    : "border-transparent"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
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
        </div>

        <p className="text-xl font-bold text-primary mb-6">
          {formatPrice(product.price, currency)}
        </p>

        <div className="space-y-6">
          {product.colors.length > 0 && (
            <div>
              <h3 className="text-sm text-primary mb-2 uppercase">
                Color: <span className="font-semibold">{selectedColor}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, index) => (
                  <button
                    key={`${color.name}-${index}`}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "group relative w-6 h-6 rounded-full border transition-all hover:scale-110",
                      selectedColor === color.name
                        ? "border-primary scale-110"
                        : "border-accent-2 hover:border-primary/50"
                    )}
                    title={color.name}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    {selectedColor === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
              className={cn(
                "flex-1 transition-all duration-200",
                (isInCart || justAdded) && "bg-primary/90"
              )}
              leftIcon={
                (isInCart || justAdded) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )
              }
            >
              {justAdded ? 'Added to Cart!' : isInCart ? 'In Cart - Add More' : 'Add to Cart'}
            </Button>
            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className={cn(isFavorite && "bg-red-50 border-red-500")}
            >
              <Heart className={cn(
                "w-5 h-5",
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
                {product.features.length > 0 && (
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-grey">
                        <span className="text-primary mt-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
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