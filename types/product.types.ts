export interface Product {
  id: string;
  name: string;
  price: number;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: Size[];
  category: Category;
  inStock: boolean;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
}

export interface ProductImage {
  url: string;
  color: string;
  alt: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type Category = 'Shirts' | 'Caps' | 'Hoodie' | 'Headband' | 'Hat' | 'Jackets';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  color: string;
  size: Size;
  customization?: BYOMCustomization;
}

import { BYOMCustomization } from './byom.types';