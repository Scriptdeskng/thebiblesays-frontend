'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const reference = searchParams.get('reference');
  const payment = searchParams.get('payment');
  const error = searchParams.get('error');

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/cart');
    }
  }, [countdown, router]);

  const getFailureReason = () => {
    if (payment === 'cancelled') {
      return 'You cancelled the payment';
    }
    if (error) {
      return error;
    }
    return 'Payment could not be processed';
  };

  return (
    <div className="mx-auto px-5 sm:px-10 lg:px-20 py-16 max-w-[1536px] min-h-[60vh]">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Payment Failed
        </h1>
        
        <p className="text-lg text-grey mb-2">
          {getFailureReason()}
        </p>

        {reference && (
          <p className="text-sm text-grey mb-8">
            Reference: <span className="font-mono">{reference}</span>
          </p>
        )}

        <div className="bg-accent-1 border border-accent-2 rounded-lg p-6 text-left mb-8">
          <h2 className="font-semibold text-primary mb-3">What happened?</h2>
          <ul className="space-y-2 text-sm text-grey">
            {payment === 'cancelled' ? (
              <>
                <li>• You closed the payment window or clicked cancel</li>
                <li>• Your order was not created</li>
                <li>• No charges were made to your account</li>
                <li>• Your cart items are still saved</li>
              </>
            ) : (
              <>
                <li>• The payment could not be completed</li>
                <li>• Your order was not created</li>
                <li>• No charges were made to your account</li>
                <li>• Your cart items are still saved</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-8">
          <h2 className="font-semibold text-primary mb-3">What's next?</h2>
          <ul className="space-y-2 text-sm text-grey">
            <li>• Check your payment details and try again</li>
            <li>• Make sure you have sufficient funds</li>
            <li>• Try a different payment method</li>
            <li>• Contact us if the problem persists</li>
          </ul>
        </div>

        <p className="text-sm text-grey mb-6">
          Redirecting to cart in {countdown} seconds...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/cart">
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/shop">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-accent-2">
          <p className="text-sm text-grey">
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}