import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (productId) => set((state) => ({
        items: state.items.includes(productId) ? state.items : [...state.items, productId],
      })),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter((id) => id !== productId),
      })),

      isInWishlist: (productId) => get().items.includes(productId),

      toggleItem: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);