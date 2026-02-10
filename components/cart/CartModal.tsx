'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BYOMCartItem } from '@/components/cart/BYOMCartItem';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice } from '@/utils/format';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useEffect } from 'react';
import { productService } from '@/services/product.service';
import toast from 'react-hot-toast';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { currency, getCurrencyParam } = useCurrencyStore();
  const { accessToken } = useAuthStore();
  
  useEffect(() => {
    const updatePrices = async () => {
      if (items.length === 0) return;
      const currencyParam = getCurrencyParam();
      const productSlugs = items
        .map(item => item.product?.slug)
        .filter((slug): slug is string => typeof slug === 'string' && !slug.startsWith('custom-'));

      const uniqueSlugs = [...new Set(productSlugs)];

      for (const slug of uniqueSlugs) {
        try {
          const updatedProduct = await productService.getProductBySlug(slug, currencyParam);

          if (updatedProduct) {
            items.forEach(item => {
              if (item.product?.slug === slug) {
                item.product.price = updatedProduct.price;
              }
            });
          }
        } catch (error) {}
      }
      useCartStore.setState({ items: [...items] });
    };
    updatePrices();
  }, [currency, getCurrencyParam]);

  if (!isOpen) return null;

  const getItemKey = (item: any, index: number) => {
    if (item.customization) {
      return `${item.productId}-${item.size}-${index}`;
    }
    return `${item.productId}-${item.color}-${item.size}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-accent-2 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-primary">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-accent-1 rounded-full flex items-center justify-center mb-4">
              <X className="w-12 h-12 text-grey" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">Your cart is empty</h3>
            <p className="text-grey mb-6">Add items to get started</p>
            <Link href="/shop">
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {items.map((item, index) => {
                const uniqueKey = getItemKey(item, index);
                
                return (
                  <div key={uniqueKey}>
                    <div className="flex gap-4 pb-4 border-b border-accent-2">
                      <div className="relative w-20 h-20 bg-accent-1 rounded-md overflow-hidden shrink-0">
                        <Image
                          src={item.product.images.find(img => img.color === item.color)?.url || item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-primary mb-1 truncate">
                          {item.product.name}
                          {item.customization && <span className="text-xs text-grey ml-2">(Custom)</span>}
                        </h3>
                        <p className="text-sm text-grey mb-2">
                          {item.color} • {item.size}
                        </p>
                        {!item.customization && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                              className="p-1 border border-accent-2 rounded hover:bg-accent-1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                              className="p-1 border border-accent-2 rounded hover:bg-accent-1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {item.customization && (
                          <div className="text-sm text-grey">
                            Quantity: {item.quantity}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={async () => {
                            try {
                              await removeItem(item.productId, item.color, item.size, accessToken || undefined);
                              toast.success('Item removed from cart');
                            } catch (error: any) {
                              toast.error(error.message || 'Failed to remove item');
                            }
                          }}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-grey" />
                        </button>
                        <p className="text-primary">
                          {formatPrice(item.product.price * item.quantity, currency)}
                        </p>
                      </div>
                    </div>

                    {item.customization && (
                      <BYOMCartItem item={item} compact />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-accent-2 p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-grey">Total</span>
                <span className="font-bold text-primary text-xl">
                  {formatPrice(getTotal(), currency)}
                </span>
              </div>

              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full">Checkout</Button>
                </Link>

                <div className='w-full flex items-center justify-center mt-5'>
                  <Link href="/cart" onClick={onClose} className='underline'>
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};