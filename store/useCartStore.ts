import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Size, Category } from '@/types/product.types';
import { cartService } from '@/services/cart.service';

interface CartState {
  items: CartItem[];
  serverCartId: number | null;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: (token: string) => Promise<void>;
  setServerCartId: (id: number | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const inferCategory = (productName: string): Category => {
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('shirt') || nameLower.includes('tee')) return 'Shirts';
  if (nameLower.includes('cap')) return 'Caps';
  if (nameLower.includes('hoodie')) return 'Hoodie';
  if (nameLower.includes('headband')) return 'Headband';
  if (nameLower.includes('hat')) return 'Hat';
  if (nameLower.includes('jacket')) return 'Jackets';
  return 'Shirts';
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      serverCartId: null,
      isLoading: false,

      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.color === newItem.color &&
            item.size === newItem.size
        );

        if (existingIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIndex].quantity += newItem.quantity;
          return { items: updatedItems };
        }

        return { items: [...state.items, newItem] };
      }),

      removeItem: (productId, color, size) => set((state) => ({
        items: state.items.filter(
          (item) =>
            !(item.productId === productId && item.color === color && item.size === size)
        ),
      })),

      updateQuantity: (productId, color, size, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId && item.color === color && item.size === size
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        ),
      })),

      clearCart: () => set({ items: [], serverCartId: null }),

      syncWithServer: async (token: string) => {
        set({ isLoading: true });

        try {
          const serverCart = await cartService.getCart(token);

          if (serverCart && serverCart.items.length > 0) {
            const serverItems: CartItem[] = serverCart.items.map((item) => {
              const size = item.product_variant.size.name as Size;
              const category = inferCategory(item.product_variant.product.name);

              return {
                productId: item.product_variant.product.id.toString(),
                color: item.product_variant.color.name,
                size: size,
                quantity: item.quantity,
                product: {
                  id: item.product_variant.product.id.toString(),
                  name: item.product_variant.product.name,
                  slug: item.product_variant.product.slug,
                  price: parseFloat(item.product_variant.current_price),
                  images: [
                    {
                      url: item.product_variant.product.featured_image,
                      color: item.product_variant.color.name,
                      alt: item.product_variant.product.name,
                    }
                  ],
                  colors: [
                    {
                      name: item.product_variant.color.name,
                      hex: item.product_variant.color.hex_code,
                    }
                  ],
                  sizes: [size] as readonly Size[],
                  category: category,
                  inStock: item.product_variant.stock > 0,
                  description: '',
                  features: [],
                  rating: 0,
                  reviewCount: 0,
                },
              };
            });

            set({
              items: serverItems,
              serverCartId: serverCart.id,
              isLoading: false
            });
          } else {
            set({
              items: [],
              serverCartId: serverCart?.id || null,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error syncing cart with server:', error);
          set({ isLoading: false });
        }
      },

      setServerCartId: (id) => set({ serverCartId: id }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        serverCartId: state.serverCartId,
      }),
    }
  )
);