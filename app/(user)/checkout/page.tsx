'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { addressService } from '@/services/address.service';
import { paymentService, PaymentMethod } from '@/services/payment.service';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PayazaCheckout from 'payaza-web-sdk';
import { PayazaCheckoutOptionsInterface } from 'payaza-web-sdk/lib/PayazaCheckoutDataInterface';
import { ConnectionMode } from "payaza-web-sdk/lib/PayazaCheckout";
import { productService } from '@/services/product.service';

interface Address {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const { currency, getCurrencyParam } = useCurrencyStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  const paymentMethod: PaymentMethod = currency === 'USD' ? 'stripe' : 'payaza';

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
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

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (isAuthenticated && accessToken) {
        setIsLoadingAddresses(true);
        try {
          const fetchedAddresses = await addressService.getAddresses(accessToken);
          setAddresses(fetchedAddresses || []);

          const defaultAddress = fetchedAddresses.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();
  }, [isAuthenticated, accessToken]);

  const subtotal = getTotal();
  const shipping = 500;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (isAuthenticated && addresses.length > 0 && !useNewAddress && !selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (useNewAddress || !isAuthenticated || (isAuthenticated && addresses.length === 0)) {
      if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.phoneNumber || !formData.address_line1 || !formData.city ||
        !formData.state) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const currencyParam = getCurrencyParam();

      const orderData: any = {
        payment_method: paymentMethod,
      };

      if (isAuthenticated && selectedAddressId && !useNewAddress) {
        orderData.shipping_address_id = selectedAddressId;
      } else {
        orderData.shipping_address = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phoneNumber,
        };
      }

      if (!isAuthenticated) {
        orderData.email = formData.email;
      } else {
        orderData.email = user?.email || formData.email;
      }

      if (!orderData.email) {
        toast.error('Email is required for payment processing');
        return;
      }

      orderData.items = items.map(item => {
        const orderItem: any = {
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        };

        if (item.productId && item.productId !== '0') {
          orderItem.product_id = parseInt(item.productId);
        }
        if (item.customization) {
          orderItem.customization = item.customization;
        }

        return orderItem;
      });

      if (paymentMethod === 'payaza') {
        await handlePayazaCheckout(orderData, currencyParam);
      } else if (paymentMethod === 'stripe') {
        await handleStripeCheckout(orderData, currencyParam);
      } else {
        await handleTraditionalCheckout(orderData, currencyParam);
      }

    } catch (error: any) {
      console.error('Checkout error:', error);

      if (error?.response?.data) {
        const errors = error.response.data;

        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value[0]}`;
              }
              return `${key}: ${value}`;
            })
            .join(', ');

          toast.error(errorMessages || 'Checkout failed. Please try again.');
        } else {
          toast.error(errors || 'Checkout failed. Please try again.');
        }
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Checkout failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTraditionalCheckout = async (orderData: any, currencyParam: string) => {
    const { order, paymentUrl } = await paymentService.checkout(
      orderData,
      accessToken || undefined,
      currencyParam
    );

    if (isAuthenticated && accessToken && saveAddress && orderData.shipping_address) {
      try {
        const addressData: any = {
          label: 'Home',
          address_type: 'home' as const,
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address_line1: orderData.shipping_address.address_line1,
          city: orderData.shipping_address.city,
          state: orderData.shipping_address.state,
          postal_code: orderData.shipping_address.postal_code || '000000',
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
          is_default: addresses.length === 0,
        };

        if (orderData.shipping_address.address_line2) {
          addressData.address_line2 = orderData.shipping_address.address_line2;
        }

        await addressService.createAddress(accessToken, addressData);
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }

    clearCart();
    window.location.href = paymentUrl;
  };

  const handleStripeCheckout = async (orderData: any, currencyParam: string) => {
    const { order, paymentUrl, sessionId } = await paymentService.checkout(
      orderData,
      accessToken || undefined,
      currencyParam
    );

    if (isAuthenticated && accessToken && saveAddress && orderData.shipping_address) {
      try {
        const addressData: any = {
          label: 'Home',
          address_type: 'home' as const,
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address_line1: orderData.shipping_address.address_line1,
          city: orderData.shipping_address.city,
          state: orderData.shipping_address.state,
          postal_code: orderData.shipping_address.postal_code || '000000',
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
          is_default: addresses.length === 0,
        };

        if (orderData.shipping_address.address_line2) {
          addressData.address_line2 = orderData.shipping_address.address_line2;
        }

        await addressService.createAddress(accessToken, addressData);
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }

    clearCart();

    window.location.href = paymentUrl;
  };

  const handlePayazaCheckout = async (orderData: any, currencyParam: string) => {
    const { order, reference } = await paymentService.createOrderForPayaza(
      orderData,
      accessToken || undefined,
      currencyParam
    );

    if (isAuthenticated && accessToken && saveAddress && orderData.shipping_address) {
      try {
        const addressData: any = {
          label: 'Home',
          address_type: 'home' as const,
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address_line1: orderData.shipping_address.address_line1,
          city: orderData.shipping_address.city,
          state: orderData.shipping_address.state,
          postal_code: orderData.shipping_address.postal_code || '000000',
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
          is_default: addresses.length === 0,
        };

        if (orderData.shipping_address.address_line2) {
          addressData.address_line2 = orderData.shipping_address.address_line2;
        }

        await addressService.createAddress(accessToken, addressData);
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }

    const shippingAddress = orderData.shipping_address || {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phoneNumber,
    };

    const payazaData: PayazaCheckoutOptionsInterface = {
      merchant_key: process.env.NEXT_PUBLIC_PAYAZA_PUBLIC_KEY?.trim() || '',
      connection_mode: ConnectionMode.TEST,
      checkout_amount: total,
      currency_code: 'NGN',
      currency: 'NGN',
      email_address: orderData.email,
      first_name: shippingAddress.first_name,
      last_name: shippingAddress.last_name,
      phone_number: shippingAddress.phone || formData.phoneNumber,
      transaction_reference: reference,
      onClose: () => {
        toast('Payment window closed', {
          duration: 3000,
        });
        setIsProcessing(false);
      },
      callback: async (response: any) => {
        await handlePayazaCallback(response, order, currencyParam);
      },
    };

    const checkout = new PayazaCheckout(payazaData);
    checkout.showPopup();
  };

  const handlePayazaCallback = async (
    response: any,
    order: any,
    currencyParam: string
  ) => {
    if (response.type === 'success') {
      try {
        const verificationResult = await paymentService.verifyPayazaPayment(
          response.data.transaction_reference,
          accessToken || undefined,
          currencyParam
        );

        if (verificationResult.status === 'success') {
          toast.success('Payment successful!');
          clearCart();

          router.push(`/order-confirmation?order=${order.order_number}`);
        } else {
          toast.error('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment. Please contact support.');
      }
    } else {
      const errorData = response.data as any;
      toast.error(errorData.message || 'Payment failed');
    }

    setIsProcessing(false);
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>

      {isUpdatingPrices && (
        <div className="mb-4 bg-secondary border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary/70" />
          <span className="text-sm text-primary">Updating prices to {currency}...</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white border border-accent-2 rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isAuthenticated && !!user?.firstName && !useNewAddress}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isAuthenticated && !!user?.lastName && !useNewAddress}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isAuthenticated}
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={isAuthenticated && !!user?.phoneNumber && !useNewAddress}
                />
              </div>
            </div>

            <div className="bg-white border border-accent-2 rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Shipping Address</h2>

              {isAuthenticated && addresses.length > 0 && !useNewAddress && (
                <div className="mb-6">
                  <p className="text-sm text-grey mb-3">Select a saved address:</p>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-accent-2 hover:border-primary/50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-semibold text-primary">
                            {address.label}
                            {address.is_default && (
                              <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-grey mt-1">
                            {address.first_name} {address.last_name}
                          </p>
                          <p className="text-sm text-grey">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-grey">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-grey">{address.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    + Use a different address
                  </button>
                </div>
              )}

              {(useNewAddress || !isAuthenticated || addresses.length === 0) && (
                <div className="space-y-4">
                  {isAuthenticated && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewAddress(false);
                        setSelectedAddressId(addresses.find(a => a.is_default)?.id || null);
                      }}
                      className="mb-4 text-sm text-primary hover:underline"
                    >
                      ← Use saved address
                    </button>
                  )}

                  <Input
                    label="Street Address"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Apartment, suite, etc. (optional)"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Zip Code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                    />
                    <Input
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {isAuthenticated && (
                    <div className="flex items-start gap-3 p-4 bg-accent-1 rounded-lg mt-4">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="mt-1 w-4 h-4"
                      />
                      <label htmlFor="saveAddress" className="text-sm text-grey cursor-pointer">
                        <span className="font-medium text-primary">Save this address to my profile</span>
                        <br />
                        This address will be saved for future orders
                        {addresses.length === 0 && ' and set as your default address'}
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-accent-2 rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Payment Method</h2>

              {currency === 'USD' ? (
                <div className="p-4 border border-primary bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                      <svg className="w-8 h-8" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="28" height="28" rx="4" fill="#635BFF" />
                        <path d="M13.3 12.5c0-.9-.6-1.3-1.5-1.3h-1v2.7h1c.9 0 1.5-.5 1.5-1.4zm.3 3.3c0-1-.7-1.5-1.7-1.5h-1.2v3h1.2c1 0 1.7-.5 1.7-1.5z" fill="white" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Stripe</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-primary bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">P</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Payaza</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-accent-2 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3">
                  <div className="relative w-16 h-16 bg-accent-1 rounded-md overflow-hidden shrink-0">
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary truncate">{item.product.name}</p>
                    <p className="text-xs text-grey">{item.color} • {item.size}</p>
                    <p className="text-xs text-grey">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-primary">
                    {formatPrice(item.product.price * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-accent-2 pt-4 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-grey">Subtotal</span>
                <span className="text-primary">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Shipping</span>
                <span className="text-primary">{formatPrice(shipping, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Tax</span>
                <span className="text-primary">{formatPrice(tax, currency)}</span>
              </div>
              <div className="border-t border-accent-2 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}