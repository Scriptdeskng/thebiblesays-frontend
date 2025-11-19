import { Size } from './product.types';

export type MerchType = 'tshirt' | 'longsleeve' | 'hoodie' | 'trouser' | 'short' | 'hat';
export type PlacementZone = 'front' | 'back' | 'sleeve';

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
}

export interface CustomSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
}

export interface DesignSide {
  texts: CustomText[];
  stickers: CustomSticker[];
}

export interface BYOMCustomization {
  merchType: MerchType;
  color: string;
  colorName?: string;
  size: Size;
  front: DesignSide;
  back: DesignSide;
  sleeve?: DesignSide;
}

export interface Sticker {
  id: string;
  url: string;
  name: string;
}