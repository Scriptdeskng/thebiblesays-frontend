"use client";

import { Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ValuePickerProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  formatValue?: (value: number) => string;
  inputClassName?: string;
  helperText?: string;
}

const buttonClass =
  "w-10 h-10 rounded-lg border border-accent-2 flex items-center justify-center text-admin-primary hover:bg-admin-primary/5";

export default function ValuePicker({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  formatValue = formatCurrency,
  inputClassName = "",
  helperText,
}: ValuePickerProps) {
  const handleDecrement = () => onChange(Math.max(min, value - step));
  const handleIncrement = () => onChange(value + step);
  const parseInput = (raw: string) =>
    Math.max(min, parseInt(raw.replace(/\D/g, ""), 10) || 0);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(parseInput(e.target.value));

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-admin-primary mb-1">
          {label}
        </label>
      )}
      <div className="w-full flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={handleDecrement}
          className={buttonClass}
          aria-label="Decrease"
        >
          <Minus size={18} />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={formatValue(value)}
          onChange={handleInputChange}
          className={`${inputClassName} w-full px-4 py-2 border border-accent-2 rounded-lg text-admin-primary`}
        />

        <button
          type="button"
          onClick={handleIncrement}
          className={buttonClass}
          aria-label="Increase"
        >
          <Plus size={18} />
        </button>
      </div>

      {helperText && (
        <p className="text-sm text-admin-primary/60 mt-1">{helperText}</p>
      )}
    </div>
  );
}
