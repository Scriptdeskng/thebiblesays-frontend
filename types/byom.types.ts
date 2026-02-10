import { Size } from './product.types';

export type MerchType = 'tshirt' | 'longsleeve' | 'hoodie' | 'trouser' | 'short' | 'hat';
export type PlacementZone = 'front' | 'back' | 'side';

export interface CustomText {
  id: string;
  content: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  color: string;
  x: number;
  y: number;
  letterSpacing?: number;
  lineHeight?: number;
  strikethrough?: boolean;
}

export interface CustomAsset {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
}

export interface DesignSide {
  texts: CustomText[];
  assets: CustomAsset[];
}

export interface BYOMCustomization {
  merchType: MerchType;
  size: Size;
  front: DesignSide;
  back: DesignSide;
  side: DesignSide;
}

export interface Asset {
  id: number;
  name: string;
  image: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface BYOMProduct {
  id: number;
  name: string;
  slug: string;
  featured_image: string;
  category: string;
  base_price?: number;
  price?: number;
  customization_info?: {
    pricing_available: boolean;
    base_customization_fee: number;
    placement_options: string[];
    supports_text: boolean;
    supports_image: boolean;
    max_image_size_mb: number;
  };
}