'use client';

import { Trash2, Minus, Plus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BYOMCartItem } from '@/components/cart/BYOMCartItem';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { formatPrice } from '@/utils/format';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { currency, getCurrencyParam } = useCurrencyStore();
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  useEffect(() => {
    const updatePrices = async () => {
      if (items.length === 0) return;
      setIsUpdatingPrices(true);
      const currencyParam = getCurrencyParam();
      const productSlugs = items
        .map(item => item.product?.slug)
        .filter((slug): slug is string => Boolean(slug));

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
        } catch (error) {
          console.error(`Error updating price for ${slug}:`, error);
        }
      }
      useCartStore.setState({ items: [...items] });
      setIsUpdatingPrices(false);
    };
    updatePrices();
  }, [currency, getCurrencyParam]);

  const subtotal = getTotal();
  const shipping = subtotal > 0 ? 500 : 0;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-accent-1 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-12 h-12 text-grey" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">Your cart is empty</h1>
          <p className="text-grey mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <h1 className="text-2xl font-bold text-primary mb-8">Shopping Cart</h1>

      {isUpdatingPrices && (
        <div className="mb-4 bg-secondary border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary/70" />
          <span className="text-sm text-primary">Updating prices to {currency}...</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.color}-${item.size}`}>
              <div className="bg-white border border-accent-2 rounded-lg p-4 flex gap-4">
                <div className="relative w-24 h-24 bg-accent-1 rounded-md overflow-hidden shrink-0">
                  <Image
                    src={item.product.images.find(img => img.color === item.color)?.url || item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className='w-full'>
                  <div className='flex flex-row justify-between items-start'>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary mb-1">{item.product.name}</h3>
                      <p className="text-sm text-grey mb-2">
                        Color: {item.color} • Size: {item.size}
                      </p>
                      <p className="font-bold text-primary">{formatPrice(item.product.price, currency)}</p>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-primary" />
                    </button>
                  </div>

                  <div className="flex flex-row items-end justify-between mt-4">
                    <div className="flex items-center gap-1 border border-accent-2 sm:px-2 sm:py-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                        className="p-1.5 hover:bg-accent-1 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium min-w-[3ch] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                        className="p-1.5 hover:bg-accent-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-primary xl:text-lg">
                      {formatPrice(item.product.price * item.quantity, currency)}
                    </p>
                  </div>
                </div>
              </div>

              {item.customization && (
                <BYOMCartItem item={item} />
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-accent-2 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-grey">Subtotal</span>
                <span className="font-semibold text-primary">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Shipping</span>
                <span className="font-semibold text-primary">{formatPrice(shipping, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Tax</span>
                <span className="font-semibold text-primary">{formatPrice(tax, currency)}</span>
              </div>
              <div className="border-t border-accent-2 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total, currency)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <Link href="/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </Link>

              <div className='flex items-center justify-center mt-5'>
                <Link href="/shop" className="underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}