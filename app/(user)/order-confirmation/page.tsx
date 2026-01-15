'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { orderService, Order } from '@/services/order.service';
import { formatPrice } from '@/utils/format';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { BsBoxSeam } from 'react-icons/bs';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const { accessToken } = useAuthStore();
  const { currency } = useCurrencyStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber || !accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const orderData = await orderService.getOrderByNumber(accessToken, orderNumber);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber, accessToken]);

  if (isLoading) {
    return (
      <div className="max-w-2xl min-h-[50vh] mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-grey">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-5 sm:px-10 lg:px-20 py-8 max-w-[1536px]">
      <div >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <BsBoxSeam className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-3">
          Thank You! Your Order Has Been Confirmed
        </h1>
        <p className="text-grey mb-6">
          We’ve received your order and our team is already preparing it with care
        </p>

        {order && (
          <div className="text-left mb-8 space-y-4">
            <div className="border-b border-accent-2 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex gap-2 text-sm items-center">
                  <p className="text-sm text-grey">Order Number</p>
                  <p className="font-medium text-primary">{orderNumber || `ORD-${Date.now()}`}</p>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-grey">
                      {item.product_name} ({item.color}, {item.size}) × {item.quantity}
                    </span>
                    <span className="text-primary font-medium">
                      {formatPrice(parseFloat(item.total_price), currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-accent-2 rounded-lg p-4 max-w-sm">
              <p className="text-sm text-grey mb-2">Shipping Address</p>
              <p className="text-lg font-medium text-primary">{order.shipping_address}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-grey">Subtotal</span>
                <span className="text-primary">{formatPrice(parseFloat(order.subtotal), currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey">Shipping</span>
                <span className="text-primary">{formatPrice(parseFloat(order.shipping_fee), currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey">Tax</span>
                <span className="text-primary">{formatPrice(parseFloat(order.tax), currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-accent-2">
                <span className="font-semibold text-primary">Total</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(parseFloat(order.total), currency)}
                </span>
              </div>
            </div>
          </div>
        )}



        <p className="text-sm text-grey mb-8">
          You will receive an email confirmation shortly with your order details and tracking information.
        </p>

        <div className="space-y-3 md:flex items-center gap-10 justify-end">
          {accessToken && (
            <Button asChild size="lg" className="w-full">
              <Link href="/profile?tab=orders">View Order Details</Link>
            </Button>
          )}
          <Button asChild size="lg" className="w-full md:w-52">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}