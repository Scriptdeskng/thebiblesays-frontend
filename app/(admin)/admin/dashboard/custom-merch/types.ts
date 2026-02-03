import type { CustomMerch, ProductCategory } from "@/types/admin.types";

export type PageTab = "custom-asset" | "pricing" | "orders";

export interface CustomMerchOrderRow {
  id: string;
  orderId: string;
  products: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

export interface ByomProductApi {
  id: number;
  name: string;
  description: string;
  price: string;
  category_name: string;
  tags?: unknown[];
  tag_names?: string[];
  colors?: unknown[];
  color_names?: string[];
  stock_level?: number;
  stock_status?: string;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  is_active: boolean;
  average_rating?: string;
  review_count?: number;
  sold_count?: number;
  created_at: string;
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

export interface UploadFormState {
  name: string;
  description: string;
  price: number;
  category: number;
  subcategory: number;
  tag_ids: number[];
  color_ids: number[];
  stock_level: number;
  is_active: boolean;
}

export type { CustomMerch, ProductCategory };
