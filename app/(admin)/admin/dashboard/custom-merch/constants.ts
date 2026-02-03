import type { PricingConfig, PageTab } from "./types";

export const DEFAULT_PRICING: PricingConfig = {
  product: 0,
  baseFee: 0,
  imageCustomizationFee: 0,
  textsCustomizationFee: 0,
  frontFee: 0,
  backFee: 0,
  sideFee: 0,
  is_active: true,
  priority: 2147483647,
};

export const BYOM_CATEGORIES = [
  { value: 0, label: "Logo" },
  { value: 1, label: "T-shirt" },
  { value: 2, label: "Hoodie" },
  { value: 3, label: "Sweat-shirt" },
  { value: 4, label: "Cap" },
];

export const BYOM_TAG_OPTIONS = [
  { id: 0, name: "Faith" },
  { id: 1, name: "Grace" },
  { id: 2, name: "Hope" },
  { id: 3, name: "Love" },
];

export const TABS: { id: PageTab; label: string }[] = [
  { id: "custom-asset", label: "Custom asset" },
  { id: "pricing", label: "Pricing configuration" },
  { id: "orders", label: "Custom merch orders" },
];
