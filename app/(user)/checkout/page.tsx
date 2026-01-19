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
import { geocodingService } from '@/services/geocoding.service';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';
import { Loader2, MapPin } from 'lucide-react';
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
  longitude?: number;
  latitude?: number;
  is_default: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

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
            // Set coordinates from default address if available
            if (defaultAddress.latitude && defaultAddress.longitude) {
              setCoordinates({
                latitude: defaultAddress.latitude,
                longitude: defaultAddress.longitude
              });
            }
          }
        } catch (error) {
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();
  }, [isAuthenticated, accessToken]);

  // Geocode address whenever address fields change
  useEffect(() => {
    const geocodeAddressDebounced = async () => {
      // Only geocode if we have all required address fields
      if (formData.address_line1 && formData.city && formData.state && formData.country) {
        setIsGeocodingAddress(true);

        try {
          const result = await geocodingService.geocodeAddress({
            address_line1: formData.address_line1,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code
          });

          if (result) {
            setCoordinates({
              latitude: result.latitude,
              longitude: result.longitude
            });
          }
        } catch (error) {
          console.error('Failed to geocode address:', error);
        } finally {
          setIsGeocodingAddress(false);
        }
      }
    };

    // Debounce the geocoding to avoid too many API calls
    const timeoutId = setTimeout(geocodeAddressDebounced, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.address_line1, formData.city, formData.state, formData.country, formData.postal_code]);

  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (useNewAddress || !isAuthenticated || (isAuthenticated && addresses.length === 0)) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      }

      if (!formData.address_line1.trim()) {
        errors.address_line1 = 'Street address is required';
      }

      if (!formData.city.trim()) {
        errors.city = 'City is required';
      }

      if (!formData.state.trim()) {
        errors.state = 'State is required';
      }

      if (!formData.country.trim()) {
        errors.country = 'Country is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    // Check if we have coordinates for new addresses
    if ((useNewAddress || !isAuthenticated || addresses.length === 0) && !coordinates) {
      toast.loading('Getting address coordinates...', { id: 'geocoding' });

      try {
        const result = await geocodingService.geocodeAddress({
          address_line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code
        });

        if (result) {
          setCoordinates({
            latitude: result.latitude,
            longitude: result.longitude
          });
        } else {
          toast.error('Could not determine location from address. Please verify your address.', { id: 'geocoding' });
          return;
        }

        toast.dismiss('geocoding');
      } catch (error) {
        toast.error('Failed to get location. Please try again.', { id: 'geocoding' });
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
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

        if (!selectedAddress) {
          toast.error('Selected address not found');
          setIsProcessing(false);
          return;
        }

        orderData.shipping_address = {
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
          longitude: selectedAddress.longitude,
          latitude: selectedAddress.latitude,
        };
      } else {
        orderData.shipping_address = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code || '000000',
          country: formData.country,
          phone: formData.phoneNumber,
          longitude: coordinates?.longitude,
          latitude: coordinates?.latitude,
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

      if (!orderData.shipping_address) {
        toast.error('Shipping address was not set properly');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === 'payaza') {
        await handlePayazaCheckout(orderData, currencyParam);
      } else if (paymentMethod === 'stripe') {
        await handleStripeCheckout(orderData, currencyParam);
      }

    } catch (error: any) {
      let errorMessage = 'Checkout failed. Please try again.';

      if (error?.response?.data) {
        const errors = error.response.data;

        if (typeof errors === 'object' && !Array.isArray(errors)) {
          const messages = Object.entries(errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value[0]}`;
              }
              return `${key}: ${value}`;
            })
            .filter(Boolean);

          if (messages.length > 0) {
            errorMessage = messages[0];
          }
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async (orderData: any, currencyParam: string) => {
    try {
      const { order, paymentUrl } = await paymentService.checkout(
        orderData,
        accessToken || undefined,
        currencyParam
      );

      const isNewAddressMode = useNewAddress || addresses.length === 0;

      if (isAuthenticated && accessToken && saveAddress && orderData.shipping_address && isNewAddressMode) {
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
            longitude: orderData.shipping_address.longitude,
            latitude: orderData.shipping_address.latitude,
            is_default: addresses.length === 0,
          };

          if (orderData.shipping_address.address_line2) {
            addressData.address_line2 = orderData.shipping_address.address_line2;
          }

          await addressService.createAddress(accessToken, addressData);
        } catch (error) {
        }
      }

      toast.loading('Redirecting to Stripe...', { id: 'stripe-redirect' });

      window.location.href = paymentUrl;
    } catch (error) {
      throw error;
    }
  };

  const handlePayazaCheckout = async (orderData: any, currencyParam: string) => {
    try {
      const { order, payment, transactionReference, backendReference, callbackUrl } = await paymentService.createOrderAndInitializePayaza(
        orderData,
        accessToken || undefined,
        currencyParam
      );

      const isNewAddressMode = useNewAddress || addresses.length === 0;

      if (isAuthenticated && accessToken && saveAddress && orderData.shipping_address && isNewAddressMode) {
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
            longitude: orderData.shipping_address.longitude,
            latitude: orderData.shipping_address.latitude,
            is_default: addresses.length === 0,
          };

          if (orderData.shipping_address.address_line2) {
            addressData.address_line2 = orderData.shipping_address.address_line2;
          }

          await addressService.createAddress(accessToken, addressData);
        } catch (error) {
        }
      }

      const shippingAddress = orderData.shipping_address || {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
      };

      const payazaData: PayazaCheckoutOptionsInterface = {
        merchant_key: process.env.NEXT_PUBLIC_PAYAZA_PUBLIC_KEY?.trim() || '',
        connection_mode: ConnectionMode.LIVE,
        checkout_amount: total,
        currency_code: 'NGN',
        currency: 'NGN',
        email_address: orderData.email,
        first_name: shippingAddress.first_name,
        last_name: shippingAddress.last_name,
        phone_number: shippingAddress.phone || formData.phoneNumber,
        transaction_reference: transactionReference,
        ...(callbackUrl && { callback_url: callbackUrl }),
        onClose: () => {
          toast('Payment window closed', {
            duration: 3000,
          });
          setIsProcessing(false);
        },
        callback: (response: any) => {
          if (response.type === 'success') {
            clearCart();
            toast.loading('Verifying payment...', { id: 'payment-processing' });
          } else {
            toast.error(response.data?.message || 'Payment failed');
            setIsProcessing(false);
          }
        },
      };

      const checkout = new PayazaCheckout(payazaData);
      checkout.showPopup();
    } catch (error) {
      throw error;
    }
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
                <div>
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated && !!user?.firstName && !useNewAddress}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated && !!user?.lastName && !useNewAddress}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated && !!user?.phoneNumber && !useNewAddress}
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                  )}
                </div>
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
                          onChange={() => {
                            setSelectedAddressId(address.id);
                            // Update coordinates when selecting an address
                            if (address.latitude && address.longitude) {
                              setCoordinates({
                                latitude: address.latitude,
                                longitude: address.longitude
                              });
                            }
                          }}
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
                        const defaultAddr = addresses.find(a => a.is_default);
                        setSelectedAddressId(defaultAddr?.id || null);
                        if (defaultAddr?.latitude && defaultAddr?.longitude) {
                          setCoordinates({
                            latitude: defaultAddr.latitude,
                            longitude: defaultAddr.longitude
                          });
                        }
                      }}
                      className="mb-4 text-sm text-primary hover:underline"
                    >
                      ← Use saved address
                    </button>
                  )}

                  <div>
                    <Input
                      label="Street Address"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.address_line1 && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address_line1}</p>
                    )}
                  </div>

                  <Input
                    label="Apartment, suite, etc. (optional)"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Zip Code (optional)"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                      />
                      {formErrors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.country && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                      )}
                    </div>
                  </div>

                  {isGeocodingAddress && (
                    <div className="flex items-center gap-2 text-sm text-grey">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Getting location coordinates...</span>
                    </div>
                  )}

                  {coordinates && !isGeocodingAddress && (
                    <div className="flex items-center gap-2 text-sm text-primary p-3 rounded-lg">
                      <MapPin className="w-4 h-4" />
                      <span>Location verified</span>
                    </div>
                  )}

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

            <div className="border-t border-accent-2 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}