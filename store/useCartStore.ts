import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/product.types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
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

      clearCart: () => set({ items: [] }),

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
    }
  )
);