import type { CustomMerch, ProductCategory } from "@/types/admin.types";

export type PageTab = "custom-asset" | "custom-sticker" | "pricing" | "orders";

export interface Sticker {
  id: number;
  name: string;
  image: string;
  is_active: boolean;
  created_at?: string;
}

/** Row shape used by the orders table (mapped from API) */
export interface CustomMerchOrderRow {
  id: string;
  orderId: string;
  products: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

/** Backend API response for BYOM orders list (page tab orders) */
export interface ByomOrderUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ByomOrderConfigurationJson {
  back?: { texts?: unknown[]; assets?: unknown[] };
  side?: { texts?: unknown[]; assets?: unknown[] };
  front?: { texts?: unknown[]; assets?: unknown[] };
  size?: string;
  merchType?: string;
  colorName?: string;
  [key: string]: unknown;
}

/** Backend pricing breakdown for a BYOM order */
export interface ByomPricingBreakdown {
  total: number;
  base_fee: number;
  has_text: boolean;
  has_image: boolean;
  text_cost: number;
  image_cost: number;
  combination_cost?: number;
  placement_costs?: Record<string, number>;
  placement_count?: number;
  placement_total?: number;
}

/** Single order item from GET .../designs_with_orders/ or equivalent */
export interface ByomOrderResult {
  id: number;
  user: ByomOrderUser;
  approved_at: string | null;
  approved_by: number | string | null;
  color: string;
  configuration_json: ByomOrderConfigurationJson;
  created_at: string;
  font_style: string;
  is_active: boolean;
  name: string;
  placement: string;
  product_name: string;
  rejection_reason: string | null;
  size: string;
  status: string;
  text: string;
  updated_at: string;
  uploaded_image: string | null;
  pricing_breakdown?: ByomPricingBreakdown | null;
}

export interface ByomOrdersApiResponse {
  count: number;
  results: ByomOrderResult[];
}

export interface ByomProductApi {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: string;
  featured_image?: string;
  category_name?: string;
  tags?: unknown[];
  tag_names?: string[];
  colors?: unknown[];
  color_names?: string[];
  available_color_names?: string[];
  stock_level?: number;
  stock_status?: string;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  is_active?: boolean;
  currency?: string;
  average_rating?: string;
  review_count?: number;
  sold_count?: number;
  created_at?: string;
  images_count?: number;
  total_sold?: number;
  image?: string;
  thumbnail_url?: string;
}

export interface PricingConfig {
  product: number;
  baseFee: number;
  imageCustomizationFee: number;
  textsCustomizationFee: number;
  frontFee: number;
  backFee: number;
  sideFee: number;
  is_active: boolean;
  priority: number;
}

export type ByomProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface UploadFormState {
  name: string;
  description: string;
  price: number;
  size: ByomProductSize;
  category: number;
  subcategory: number;
  tag_ids: number[];
  color_ids: number[];
  stock_level: number;
  is_active: boolean;
}

export type { CustomMerch, ProductCategory };
