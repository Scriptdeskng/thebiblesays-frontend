"use client";

import { cn } from "@/utils/cn";
import { useCurrencyStore, Currency } from "@/store/useCurrencyStore";

const currencySymbols: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
};

interface CurrencySelectorProps {
  className?: string;
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrencyStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    setCurrency(newCurrency);
  };

  return (
    <div
      className={cn(
        "bg-[#F3F3F5] rounded-md px-2 py-2 w-fit",
        className
      )}
    >
      <select
        className="outline-none pr-2 sm:pr-5 bg-transparent text-sm cursor-pointer"
        value={currency}
        onChange={handleChange}
      >
        {Object.entries(currencySymbols).map(([code, symbol]) => (
          <option key={code} value={code}>
            {symbol} {code}
          </option>
        ))}
      </select>
    </div>
  );
}