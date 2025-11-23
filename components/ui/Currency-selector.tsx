"use client";

import { cn } from "@/utils/cn";
import { useState } from "react";

type Currency = "NGN"

const currencySymbols: Record<Currency, string> = {
  NGN: "₦",
};

interface CurrencySelectorProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({
  value = "NGN",
  onChange,
  className,
}: CurrencySelectorProps) {
  const [current, setCurrent] = useState<Currency>(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    setCurrent(newCurrency);
    onChange?.(newCurrency);
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
        value={current}
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
