'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { mockProducts } from '@/lib/mockData';
import { getInitials } from '@/utils/format';
import Link from 'next/link';

type Tab = 'personal' | 'orders' | 'wishlist' | 'address';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.items);

  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [hasPhoneChanged, setHasPhoneChanged] = useState(false);
  const [address, setAddress] = useState(user?.address || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });
  const [hasAddressChanged, setHasAddressChanged] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const tabs = [
    { id: 'personal' as Tab, label: 'Personal Info', icon: User },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
    { id: 'address' as Tab, label: 'Address', icon: MapPin },
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setHasPhoneChanged(true);
  };

  const handleSavePhone = () => {
    updateUser({ phoneNumber });
    setHasPhoneChanged(false);
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    setHasAddressChanged(true);
  };

  const handleSaveAddress = () => {
    updateUser({ address });
    setHasAddressChanged(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const wishlistProducts = mockProducts.filter(p => wishlistItems.includes(p.id));

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">My Account</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-accent-2 rounded-lg p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                    ? 'bg-accent-2 text-primary'
                    : 'text-grey'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="bg-white border border-accent-2 rounded-lg p-6">
            {activeTab === 'personal' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Personal Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-grey">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="First Name" value={user.firstName} disabled />
                    <Input label="Last Name" value={user.lastName} disabled />
                  </div>
                  <Input label="Email" value={user.email} disabled />
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                  />
                  {hasPhoneChanged && (
                    <Button onClick={handleSavePhone}>Save Changes</Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Order History</h2>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-grey mx-auto mb-4" />
                  <p className="text-grey text-lg mb-4">No orders yet</p>
                  <Link href="/shop">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Wishlist</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-grey mx-auto mb-4" />
                    <p className="text-grey text-lg mb-4">No items in wishlist</p>
                    <Link href="/shop">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'address' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    value={address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                    <Input
                      label="State"
                      value={address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                    <Input
                      label="Zip Code"
                      value={address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    />
                    <Input
                      label="Country"
                      value={address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                    />
                  </div>
                  {hasAddressChanged && (
                    <Button onClick={handleSaveAddress}>Save Changes</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}