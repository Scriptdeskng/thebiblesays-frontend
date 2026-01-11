'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Package, Heart, MapPin, LogOut, FileText, CheckCircle, XCircle, Clock, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { getInitials } from '@/utils/format';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { addressService } from '@/services/address.service';
import { byomService, CustomMerchDesign } from '@/services/byom.service';
import { Product } from '@/types/product.types';
import { BYOMCustomization } from '@/types/byom.types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import Image from 'next/image';

type Tab = 'personal' | 'orders' | 'wishlist' | 'address' | 'drafts';

interface Order {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  total: string;
  created_at: string;
  items: any[];
}

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

const BASE_PRICES: Record<string, number> = {
  tshirt: 15000,
  longsleeve: 20000,
  hoodie: 35000,
  trouser: 28000,
  short: 18000,
  hat: 8000,
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser, logout, accessToken } = useAuthStore();
  const { items: wishlistItems, syncWithServer } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const initialTab = (searchParams.get('tab') as Tab) || 'personal';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [hasPhoneChanged, setHasPhoneChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [drafts, setDrafts] = useState<CustomMerchDesign[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: '',
    address_type: 'home' as 'home' | 'work' | 'other',
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    phone: user?.phoneNumber || '',
    is_default: false,
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login?redirect=/profile');
    }
  }, [user, accessToken, router]);

  if (!user || !accessToken) {
    return (
      <div className="max-w-[1536px] min-h-screen mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <p className="text-grey">Loading...</p>
      </div>
    );
  }

  useEffect(() => {
    if (accessToken) {
      syncWithServer(accessToken);
    }
  }, [accessToken, syncWithServer]);

  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (activeTab !== 'wishlist' || !wishlistItems.length) return;

      setIsLoadingWishlist(true);
      try {
        const allProducts = await productService.getProducts();
        const filtered = allProducts.filter(p => wishlistItems.includes(p.id));
        setWishlistProducts(filtered);
      } catch (error) {
        console.error('Error loading wishlist products:', error);
      } finally {
        setIsLoadingWishlist(false);
      }
    };

    loadWishlistProducts();
  }, [activeTab, wishlistItems]);

  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab !== 'orders' || !accessToken) return;

      setIsLoadingOrders(true);
      try {
        const response = await orderService.getMyOrders(accessToken);
        setOrders(response.results || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [activeTab, accessToken]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (activeTab !== 'address' || !accessToken) return;

      setIsLoadingAddresses(true);
      try {
        const fetchedAddresses = await addressService.getAddresses(accessToken);
        setAddresses(fetchedAddresses || []);
      } catch (error) {
        console.error('Error loading addresses:', error);
        setAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [activeTab, accessToken]);

  useEffect(() => {
    const loadDrafts = async () => {
      if (activeTab !== 'drafts' || !accessToken) return;

      setIsLoadingDrafts(true);
      try {
        const savedDesigns = await byomService.getSavedDesigns(accessToken);
        setDrafts(savedDesigns || []);
      } catch (error) {
        console.error('Error loading drafts:', error);
        setDrafts([]);
      } finally {
        setIsLoadingDrafts(false);
      }
    };

    loadDrafts();
  }, [activeTab, accessToken]);

  const tabs = [
    { id: 'personal' as Tab, label: 'Personal Info', icon: User },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
    { id: 'drafts' as Tab, label: 'Drafts', icon: FileText },
    { id: 'address' as Tab, label: 'Address', icon: MapPin },
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setHasPhoneChanged(true);
  };

  const handleSavePhone = async () => {
    setIsSaving(true);
    try {
      await updateUser({ phoneNumber });
      setHasPhoneChanged(false);
      toast.success('Phone number updated successfully!');
    } catch (error) {
      toast.error('Failed to update phone number');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleAddAddress = async () => {
    if (!accessToken) return;

    if (!newAddress.first_name || !newAddress.last_name || !newAddress.address_line1 ||
      !newAddress.city || !newAddress.state || !newAddress.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await addressService.createAddress(accessToken, newAddress);
      toast.success('Address added successfully!');

      const fetchedAddresses = await addressService.getAddresses(accessToken);
      setAddresses(fetchedAddresses || []);

      setNewAddress({
        label: '',
        address_type: 'home',
        first_name: user.firstName,
        last_name: user.lastName,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Nigeria',
        phone: user.phoneNumber || '',
        is_default: false,
      });
      setIsAddingAddress(false);
    } catch (error: any) {
      if (error?.response?.data) {
        const errors = error.response.data;

        if (errors.label && Array.isArray(errors.label)) {
          toast.error(errors.label[0]);
        } else if (errors.label) {
          toast.error(errors.label);
        } else {
          const errorMessages = Object.keys(errors).map(key =>
            Array.isArray(errors[key]) ? errors[key][0] : errors[key]
          ).join(', ');
          toast.error(errorMessages || 'Failed to add address');
        }
      } else {
        toast.error('Failed to add address');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressService.deleteAddress(accessToken, addressId);
      toast.success('Address deleted successfully!');

      const fetchedAddresses = await addressService.getAddresses(accessToken);
      setAddresses(fetchedAddresses || []);
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    if (!accessToken) return;

    try {
      await addressService.setDefaultAddress(accessToken, addressId);
      toast.success('Default address updated!');

      const fetchedAddresses = await addressService.getAddresses(accessToken);
      setAddresses(fetchedAddresses || []);
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this draft?')) return;

    try {
      await byomService.deleteDesign(accessToken, draftId);
      toast.success('Draft deleted successfully!');

      const savedDesigns = await byomService.getSavedDesigns(accessToken);
      setDrafts(savedDesigns || []);
    } catch (error) {
      toast.error('Failed to delete draft');
    }
  };

  const handleAddDraftToCart = async (draft: CustomMerchDesign) => {
    if (!accessToken) return;

    if (draft.status !== 'approved') {
      toast.error('Only approved designs can be added to cart');
      return;
    }

    try {
      let config: BYOMCustomization;
      try {
        if (typeof draft.configuration_json === 'string') {
          config = JSON.parse(draft.configuration_json);
        } else {
          config = draft.configuration_json as any;
        }
      } catch (parseError) {
        console.error('Error parsing configuration:', parseError);
        toast.error('Invalid design configuration');
        return;
      }

      const basePrice = BASE_PRICES[config.merchType] || 15000;

      const textCount = (config.front?.texts?.length || 0) +
        (config.back?.texts?.length || 0) +
        (config.side?.texts?.length || 0);
      const stickerCount = (config.front?.stickers?.length || 0) +
        (config.back?.stickers?.length || 0) +
        (config.side?.stickers?.length || 0);
      const customizationCost = (textCount * 1000) + (stickerCount * 500);
      const total = basePrice + customizationCost;

      const merchImageUrl = `/byom/${config.merchType}-${config.colorName || 'black'}.svg`;

      const byomProduct = {
        id: `byom-${draft.id}`,
        name: draft.name,
        price: total,
        images: [{ url: merchImageUrl, color: 'Custom', alt: draft.name }],
        colors: [{ name: 'Custom', hex: config.color }],
        sizes: [config.size],
        category: 'Shirts' as const,
        inStock: true,
        description: `Custom ${config.merchType} with personalized design`,
        features: ['Custom design', 'Premium quality'],
        rating: 5,
        reviewCount: 0,
      };

      addItem({
        productId: byomProduct.id,
        product: byomProduct,
        quantity: 1,
        color: 'Custom',
        size: config.size,
        customization: config,
      });

      toast.success('Added to cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error adding draft to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            Draft
          </span>
        );
    }
  };

  const parseConfig = (draft: CustomMerchDesign): BYOMCustomization | null => {
    try {
      if (typeof draft.configuration_json === 'string') {
        return JSON.parse(draft.configuration_json);
      }
      return draft.configuration_json as any;
    } catch (error) {
      console.error('Error parsing configuration:', error);
      return null;
    }
  };

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
                    : 'text-grey hover:bg-accent-1'
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
                    <Button onClick={handleSavePhone} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Order History</h2>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-accent-1 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-grey mx-auto mb-4" />
                    <p className="text-grey text-lg mb-4">No orders yet</p>
                    <Link href="/shop">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-accent-2 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-primary">
                              Order #{order.order_number}
                            </p>
                            <p className="text-sm text-grey">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatPrice(parseFloat(order.total))}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                              }`}>
                              {order.status_display}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-grey">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl text-primary mb-6">Wishlist</h2>
                {isLoadingWishlist ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="aspect-square bg-accent-1 rounded-lg animate-pulse" />
                        <div className="h-4 bg-accent-1 rounded animate-pulse" />
                        <div className="h-4 bg-accent-1 rounded w-2/3 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : wishlistProducts.length === 0 ? (
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

            {activeTab === 'drafts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-primary">Custom Design Drafts</h2>
                </div>

                {isLoadingDrafts ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-40 bg-accent-1 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !drafts || drafts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-grey mx-auto mb-4" />
                    <p className="text-grey text-lg mb-4">No saved drafts</p>
                    <Link href="/byom">
                      <Button>Create Custom Merch</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((draft) => {
                      const config = parseConfig(draft);
                      if (!config) {
                        return (
                          <div key={draft.id} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                            <p className="text-red-700 text-sm">Invalid configuration data</p>
                          </div>
                        );
                      }

                      const merchImageUrl = `/byom/${config.merchType}-${config.colorName || 'black'}.svg`;

                      return (
                        <div
                          key={draft.id}
                          className={cn(
                            'border-2 rounded-lg p-4 transition-shadow',
                            draft.status === 'approved'
                              ? 'border-green-200 bg-green-50/30'
                              : draft.status === 'rejected'
                                ? 'border-red-200 bg-red-50/30'
                                : 'border-accent-2 hover:shadow-md'
                          )}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 bg-accent-1 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={merchImageUrl}
                                alt={draft.name}
                                fill
                                className="object-contain p-2"
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-primary">{draft.name}</h3>
                                  <p className="text-sm text-grey">
                                    Size: {draft.size} • Color: {draft.color}
                                  </p>
                                </div>
                                {getStatusBadge(draft.status)}
                              </div>

                              <p className="text-xs text-grey mb-3">
                                Created {new Date(draft.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>

                              {draft.status === 'rejected' && draft.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-red-800">
                                    <span className="font-semibold">Rejection Reason:</span> {draft.rejection_reason}
                                  </p>
                                </div>
                              )}

                              {draft.status === 'pending_approval' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-yellow-800">
                                    Your design is being reviewed. You'll be notified once it's approved or if changes are needed.
                                  </p>
                                </div>
                              )}

                              <div className="flex gap-2 flex-wrap">
                                {draft.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddDraftToCart(draft)}
                                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                                  >
                                    Add to Cart
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="text-red-500 border-red-200 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'address' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl text-primary">Shipping Addresses</h2>
                  <div className="">
                    <Button
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      variant="outline"
                      className=''
                    >
                      {isAddingAddress ? 'Cancel' : 'Add'}
                    </Button>
                  </div>
                </div>

                {isAddingAddress && (
                  <div className="mb-6 p-4 border border-accent-2 rounded-lg bg-accent-1">
                    <h3 className="font-semibold text-primary mb-4">New Address</h3>
                    <div className="space-y-4">
                      <Input
                        label="Label (e.g., Home, Office)"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={newAddress.first_name}
                          onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                        />
                        <Input
                          label="Last Name"
                          value={newAddress.last_name}
                          onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Address Line 1"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                      />
                      <Input
                        label="Address Line 2 (Optional)"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                        <Input
                          label="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                        <Input
                          label="Postal Code"
                          value={newAddress.postal_code}
                          onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        />
                        <Input
                          label="Phone"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                          className="w-4 h-4 rounded border-accent-2 text-primary"
                        />
                        <span className="text-sm text-grey">Set as default address</span>
                      </label>
                      <Button onClick={handleAddAddress} disabled={isSaving}>
                        {isSaving ? 'Adding...' : 'Add Address'}
                      </Button>
                    </div>
                  </div>
                )}

                {isLoadingAddresses ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-32 bg-accent-1 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !addresses || addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-grey mx-auto mb-4" />
                    <p className="text-grey text-lg mb-4">No saved addresses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 ${address.is_default
                          ? 'border-primary bg-primary/5'
                          : 'border-accent-2'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-primary">
                              {address.label}
                              {address.is_default && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-grey">
                              {address.first_name} {address.last_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-xs text-primary hover:underline"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-grey">
                          {address.address_line1}
                          {address.address_line2 && `, ${address.address_line2}`}
                        </p>
                        <p className="text-sm text-grey">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-grey">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}