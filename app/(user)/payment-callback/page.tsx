'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PaymentCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken } = useAuthStore();

    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference') ||
                searchParams.get('trxref') ||
                searchParams.get('transaction_ref');

            if (!reference) {
                setStatus('failed');
                setErrorMessage('No payment reference found');
                return;
            }

            try {
                const result = await paymentService.verifyPayment(reference, accessToken || undefined);

                if (result.status === 'success') {
                    setStatus('success');
                    setOrderNumber(result.order_number);

                    setTimeout(() => {
                        router.push(`/order-confirmation?order=${result.order_number}`);
                    }, 2000);
                } else if (result.status === 'pending') {
                    setStatus('verifying');
                    setErrorMessage('Payment is still being processed. Please check back shortly.');

                    setTimeout(() => {
                        router.push('/profile?tab=orders');
                    }, 5000);
                } else {
                    setStatus('failed');
                    setErrorMessage('Payment verification failed. Please contact support if you were charged.');
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('failed');

                if (error?.response?.data?.message) {
                    setErrorMessage(error.response.data.message);
                } else if (error?.message) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('An error occurred while verifying your payment');
                }
            }
        };

        verifyPayment();
    }, [searchParams, accessToken, router]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white border border-accent-2 rounded-lg p-8 md:p-12 text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                        <h1 className="text-2xl font-bold text-primary mb-3">
                            Verifying Payment...
                        </h1>
                        <p className="text-grey">
                            Please wait while we confirm your payment
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary mb-3">
                            Payment Successful!
                        </h1>
                        <p className="text-grey mb-6">
                            Your payment has been confirmed. Redirecting to order confirmation...
                        </p>
                        {orderNumber && (
                            <div className="bg-accent-1 rounded-lg p-4 mb-6">
                                <p className="text-sm text-grey mb-1">Order Number</p>
                                <p className="text-xl font-bold text-primary">{orderNumber}</p>
                            </div>
                        )}
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary mb-3">
                            Payment Failed
                        </h1>
                        <p className="text-grey mb-6">
                            {errorMessage}
                        </p>
                        <div className="space-y-3">
                            <Button asChild size="lg" className="w-full">
                                <Link href="/cart">Return to Cart</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full">
                                <Link href="/shop">Continue Shopping</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}