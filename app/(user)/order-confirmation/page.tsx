'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, PackageCheck } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  const orderReference = searchParams.get('reference');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderReference) {
        setIsLoading(false);
        setError('No order reference provided');
        return;
      }

      try {
        const orderData = await orderService.getOrderByNumber(orderReference, accessToken || undefined);
        setOrder(orderData);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        setError(error?.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderReference, accessToken]);

  if (isLoading) {
    return (
      <div className="max-w-2xl min-h-[60vh] mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
          <BsBoxSeam className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        <h2 className="text-xl font-semibold mt-6 text-primary">Verifying your payment...</h2>
        <p className="text-grey mt-2">We are fetching your order details from the server.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl min-h-[50vh] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">
          {error ? 'Unable to Load Order' : 'Order Not Found'}
        </h1>
        <p className="text-grey mb-8">
          {error || `We couldn't find details for order #${orderReference}.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {accessToken && (
            <Button asChild>
              <Link href="/profile?tab=orders">Go to My Orders</Link>
            </Button>
          )}
          <Button asChild variant={accessToken ? "outline" : "default"}>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-5 sm:px-10 lg:px-20 py-8 max-w-[1536px] animate-in fade-in duration-700">
      <div className="">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <PackageCheck className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-3">
          Thank You! Your Order Has Been Confirmed
        </h1>


        <p className="text-grey mb-10">
          Order Number: <span className="font-bold text-primary">#{order.order_number}</span>
        </p>

        <div className="grid grid-cols-1 gap-12">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary border-b border-accent-2 pb-2">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="max-w-[70%]">
                    <p className="font-medium text-primary uppercase">{item.product_name}</p>
                    <p className="text-grey text-xs">{item.color} | {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <span className="text-primary font-medium">
                    {formatPrice(parseFloat(item.total_price), currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-accent-1/30 p-6 rounded-xl border border-accent-2 h-fit">
              <h3 className="text-sm font-semibold text-grey uppercase tracking-wider mb-4">Shipping To</h3>
              <div className="text-primary space-y-1">
                <p className="font-bold">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p className="text-sm">{order.shipping_address.address_line1}</p>
                <p className="text-sm">{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p className="text-sm">{order.shipping_address.country}</p>
                <p className="text-sm pt-2 text-grey">{order.shipping_address.phone}</p>
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-accent-2">
              <div className="flex justify-between text-sm">
                <span className="text-grey">Subtotal</span>
                <span className="text-primary">{formatPrice(parseFloat(order.subtotal), currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-grey">Shipping</span>
                <span className="text-primary">{formatPrice(parseFloat(order.shipping_fee), currency)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-bold text-primary">Total Paid</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(parseFloat(order.total), currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-end">
          {accessToken && (
            <Button asChild variant="outline" size="lg" className="w-full md:w-52">
              <Link href="/profile?tab=orders">View Your Orders</Link>
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