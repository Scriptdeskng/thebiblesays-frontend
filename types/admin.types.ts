export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'flagged';
  ordersCount: number;
  amountSpent: number;
  lastActive: string;
  createdAt: string;
}

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL' | '5XL';
export type ProductCategory = 'Shirts' | 'Caps' | 'Hoodie' | 'Headband' | 'Hat' | 'Jackets';
export type ProductStatus = 'Active' | 'Inactive';

export interface ProductColor {
  name: string;
  hex: string;
}

export const AVAILABLE_COLORS: ProductColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF4136' },
  { name: 'Blue', hex: '#0074D9' },
  { name: 'Green', hex: '#2ECC40' },
  { name: 'Yellow', hex: '#FFDC00' },
  { name: 'Orange', hex: '#FF851B' },
  { name: 'Purple', hex: '#B10DC9' },
  { name: 'Pink', hex: '#F012BE' },
  { name: 'Teal', hex: '#39CCCC' },
  { name: 'Maroon', hex: '#85144B' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Indigo', hex: '#4B0082' },
];

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  image: string;
  status: ProductStatus;
  sales: number;
  revenue: number;
  createdAt: string;
  tags?: string[];
}

export type OrderStatus = 'delivered' | 'pending' | 'processing' | 'shipped' | 'cancelled' | 'placed';
export type PaymentMethod = 'paystack' | 'flutterwave';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  orderDate: string;
  createdAt: string;
}

export type CustomMerchStatus = 'approved' | 'pending' | 'rejected';

export interface CustomMerch {
  id: string;
  designName: string;
  designId: string;
  creator: string;
  creatorId: string;
  productType: ProductCategory;
  image: string;
  customImage?: string;
  customText?: string;
  frontView?: string;
  backView?: string;
  sideView?: string;
  amount: number;
  quantity: number;
  status: CustomMerchStatus;
  dateCreated: string;
}

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  dateTime: string;
  refundReason?: string;
}

export interface Settlement {
  id: string;
  gateway: PaymentMethod;
  grossAmount: number;
  gatewayFee: number;
  netPayout: number;
  settlementDate: string;
}

export type TicketStatus = 'pending' | 'resolved' | 'escalated';

export interface SupportTicket {
  id: string;
  orderId: string;
  title: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  description: string;
  status: TicketStatus;
  date: string;
}

export type DiscountType = 'percentage' | 'fixed';
export type DiscountStatus = 'active' | 'expired';

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  usage: number;
  usageLimit: number;
  expiryDate: string;
  status: DiscountStatus;
}

export interface LoyaltyPoint {
  id: string;
  purchaseAmount: number;
  pointsPerPurchase: number;
  referralBonus: number;
  birthdayBonus: number;
}

export interface Promotion {
  id: string;
  name: string;
  status: 'scheduled' | 'active' | 'inactive';
  startDate: string;
  endDate: string;
  discount: number;
}

export interface ShippingRegion {
  id: string;
  region: string;
  deliveryFee: number;
  timeline: string;
  status: 'active' | 'inactive';
}

export interface Role {
  id: string;
  name: string;
  membersAssigned: number;
  permissionCount: number;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

export interface DashboardStats {
  totalSales: number;
  totalSalesChange: number;
  totalOrders: number;
  totalOrdersChange: number;
  customMerch: number;
  customMerchChange: number;
  usersRegistered: number;
  usersRegisteredChange: number;
}

export interface SalesData {
  month: string;
  amount: number;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  status: 'active' | 'inactive';
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  createdAt: string;
  status: 'published' | 'draft';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  image?: string;
  status: 'approved' | 'pending';
}
