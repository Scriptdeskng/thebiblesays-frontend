'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice } from '@/utils/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Nigeria',
    createAccount: false,
  });

  const subtotal = getTotal();
  const shipping = 2000;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    router.push('/order-confirmation');
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>

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
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bg-white border border-accent-2 rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
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
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="createAccount"
                      checked={formData.createAccount}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-accent-2 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-grey">Create an account?</span>
                  </label>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Make Payment
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
                    <p className=" text-primary truncate">{item.product.name}</p>
                    <p className="text-xs text-grey">{item.color} • {item.size}</p>
                    <p className="text-xs text-grey">Qty: {item.quantity}</p>
                  </div>
                  <p className=" text-primary">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-accent-2 pt-4 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-grey">Subtotal</span>
                <span className=" text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Shipping</span>
                <span className=" text-primary">{formatPrice(shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey">Tax</span>
                <span className=" text-primary">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-accent-2 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-10">
              Make Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}