import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'NGN' | 'USD';

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencyParam: () => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'NGN',
      
      setCurrency: (currency) => set({ currency }),
      
      getCurrencyParam: () => {
        const currency = get().currency;
        return currency === 'USD' ? '?currency=usd' : '';
      },
    }),
    {
      name: 'currency-storage',
    }
  )
);