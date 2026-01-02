export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF4136' },
  { name: 'Blue', hex: '#0074D9' },
  { name: 'Green', hex: '#2ECC40' },
  { name: 'Yellow', hex: '#FFDC00' },
] as const;