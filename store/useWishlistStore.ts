import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService } from '@/services/wishlist.service';
import toast from 'react-hot-toast';

interface WishlistState {
  items: string[];
  wishlistItemIds: Map<string, number>;
  addItem: (productId: string, token?: string) => Promise<void>;
  removeItem: (productId: string, token?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (productId: string, token?: string) => Promise<void>;
  syncWithServer: (token: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistItemIds: new Map(),

      addItem: async (productId: string, token?: string) => {
        try {
          if (token) {
            const wishlistItem = await wishlistService.addToWishlist(token, parseInt(productId));
            set((state) => {
              const newMap = new Map(state.wishlistItemIds);
              newMap.set(productId, wishlistItem.id);
              return {
                items: state.items.includes(productId) ? state.items : [...state.items, productId],
                wishlistItemIds: newMap,
              };
            });
            toast.success('Added to wishlist');
          } else {
            set((state) => ({
              items: state.items.includes(productId) ? state.items : [...state.items, productId],
            }));
            toast.success('Added to wishlist (Login to save)');
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.detail || 'Failed to add to wishlist');
          throw error;
        }
      },

      removeItem: async (productId: string, token?: string) => {
        try {
          const { wishlistItemIds } = get();
          const wishlistItemId = wishlistItemIds.get(productId);

          if (token && wishlistItemId) {
            await wishlistService.removeFromWishlist(token, wishlistItemId);
            set((state) => {
              const newMap = new Map(state.wishlistItemIds);
              newMap.delete(productId);
              return {
                items: state.items.filter((id) => id !== productId),
                wishlistItemIds: newMap,
              };
            });
            toast.success('Removed from wishlist');
          } else {
            set((state) => ({
              items: state.items.filter((id) => id !== productId),
            }));
            toast.success('Removed from wishlist');
          }
        } catch (error: any) {
          toast.error('Failed to remove from wishlist');
          throw error;
        }
      },

      isInWishlist: (productId: string) => get().items.includes(productId),

      toggleItem: async (productId: string, token?: string) => {
        const { items } = get();
        if (items.includes(productId)) {
          await get().removeItem(productId, token);
        } else {
          await get().addItem(productId, token);
        }
      },

      syncWithServer: async (token: string) => {
        try {
          const serverWishlist = await wishlistService.getWishlist(token);
          const itemIds = new Map<string, number>();
          const productIds = serverWishlist.map(item => {
            const id = item.product.id.toString();
            itemIds.set(id, item.id);
            return id;
          });
          
          set({
            items: productIds,
            wishlistItemIds: itemIds,
          });
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        }
      },

      clearWishlist: () => set({ items: [], wishlistItemIds: new Map() }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);