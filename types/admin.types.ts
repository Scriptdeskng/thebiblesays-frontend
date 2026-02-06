export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive" | "flagged";
  ordersCount: number;
  amountSpent: number;
  lastActive: string;
  createdAt: string;
}

export type ProductSize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "3XL"
  | "4XL"
  | "5XL";
export type ProductCategory =
  | "Shirts"
  | "Caps"
  | "Hoodie"
  | "Headband"
  | "Hat"
  | "Jackets";
export type ProductStatus = "Active" | "Inactive";

export interface ProductColor {
  name: string;
  hex: string;
}

export const AVAILABLE_COLORS: ProductColor[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Grey", hex: "#808080" },
  { name: "Red", hex: "#FF4136" },
  { name: "Blue", hex: "#0074D9" },
  { name: "Green", hex: "#2ECC40" },
  { name: "Yellow", hex: "#FFDC00" },
  { name: "Orange", hex: "#FF851B" },
  { name: "Purple", hex: "#B10DC9" },
  { name: "Pink", hex: "#F012BE" },
  { name: "Teal", hex: "#39CCCC" },
  { name: "Maroon", hex: "#85144B" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Olive", hex: "#808000" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Indigo", hex: "#4B0082" },
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

export type OrderStatus =
  | "placed"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "backordered"
  | "pending";
export type PaymentMethod = "paystack" | "nova" | "payaza" | "stripe";
export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  itemsCount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  orderDate: string;
  createdAt: string;
}

export type CustomMerchStatus = "approved" | "pending" | "rejected" | "draft";

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
  stockStatus?: string;
  isInStock?: boolean;
  currency?: string;
}

export type TransactionStatus = "pending" | "successful" | "failed";

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderNumber: string;
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

export type TicketStatus = "pending" | "resolved" | "escalated";

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

export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "expired";

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
  status: "scheduled" | "active" | "inactive";
  startDate: string;
  endDate: string;
  discount: number;
}

export interface ShippingRegion {
  id: string;
  region: string;
  deliveryFee: number;
  timeline: string;
  status: "active" | "inactive";
}

export interface Role {
  id: string;
  name: string;
  membersAssigned: number;
  permissionCount: number;
  permissions: string[];
  status: "active" | "inactive";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: "active" | "inactive";
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
  date: string;
  daily_total: number;
  order_count: number;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  status: "active" | "inactive";
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  createdAt: string;
  status: "published" | "draft";
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
  status: "approved" | "pending";
}

// Dashboard API Types
export interface RecentOrder {
  id: number;
  order_number: string;
  user_email: string;
  user_name: string;
  subtotal: string;
  total: string;
  status: string;
  created_at: string;
  updated_at: string;
  items_count: number;
}

export interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_sales: number;
}

export interface MonthlyStats {
  orders: number;
  sales: number;
  average_order: number;
  custom_designs: number;
  pending_designs: number;
}

export interface DashboardOverview {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_categories: number;
  total_sales: number;
  average_order: number;
  recent_orders: RecentOrder[];
  top_products: TopProduct[];
  daily_sales: SalesData[];
  monthly_stats: MonthlyStats;
}

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  category_name: string;
  is_active: boolean;
  average_rating: string;
  review_count: number;
  sold_count: number;
  created_at: string;
  images_count: number;
  total_sold: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiProduct[];
}

export interface GetProductsParams {
  category?: number;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  product_count?: number;
}

export interface ApiProductImage {
  id: number;
  image: string;
  is_featured: boolean;
  created_at?: string;
}

export interface ApiProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  color: string;
  size: string;
  category: number;
  category_name: string;
  subcategory: number | null;
  subcategory_name: string | null;
  is_active: boolean;
  average_rating: string;
  review_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  images: ApiProductImage[];
  total_sold: string;
  total_revenue: string;
  stock_level?: number;
}

export interface ApiOrderItem {
  id: number;
  product_name: string;
  product_variant?: {
    id: number;
    product: number;
    color?: {
      id: number;
      name: string;
      hex_code: string;
    };
    size?: {
      id: number;
      name: string;
    };
  };
  color?: string;
  size?: string;
  price: string;
  quantity: number;
  total_price: string;
}

export interface ApiOrderUser {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
}

export interface ApiOrder {
  id: number;
  order_number: string;
  status: string;
  status_display?: string;
  user?: string | ApiOrderUser;
  user_email?: string;
  user_name?: string;
  guest_email?: string | null;
  payment_method?: string;
  payment_status?: string;
  payment_reference?: string;
  subtotal: string;
  shipping_fee?: string;
  shipping_full_address?: string;
  shipping_address?: string;
  tax?: string;
  total: string;
  discount_amount?: string;
  discount_code?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at?: string;
  items?: ApiOrderItem[];
  items_count?: number;
}

export interface ApiUserOrder {
  id: number;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
}

export interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  total_orders: string;
  total_spent: string;
  last_order_date?: string;
  orders?: ApiUserOrder[];
  custom_designs?: any[];
}

export interface ApiTransaction {
  id: number;
  user_email: string;
  order_number: string;
  amount: string;
  status: string;
  payment_method: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface DailyRevenue {
  date?: string;
  daily_total?: number | string;
  revenue?: number | string;
  payment_count?: number;
  [key: string]: any;
}

export interface PaymentMethodStat {
  payment_method?: string;
  method?: string;
  total?: number | string;
  count?: number;
  revenue?: number | string;
  [key: string]: any;
}

export interface RevenueAnalytics {
  average_payment?: number | string;
  daily_revenue?: DailyRevenue[];
  payment_count?: number | string;
  payment_method_stats?: PaymentMethodStat[];
  total_revenue?: number | string;
  [key: string]: any; // Allow for additional fields
}

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationType =
  | "new_order"
  | "custom_merch_order"
  | "low_stock"
  | "out_of_stock"
  | "new_testimonial"
  | "failed_transaction"
  | "refund_request"
  | "new_user"
  | "system_alert"
  | "discount_expiring"
  | "high_revenue_day";

export interface ApiNotification {
  id: number;
  type: NotificationType;
  type_display: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  priority_display: string;
  reference_id: string;
  content_type_name: string;
  object_id: number;
  is_read: boolean;
  age_in_hours: string;
  is_expired: string;
  created_at: string;
  [key: string]: any; // Allow for additional fields
}

export interface GetNotificationsParams {
  is_read?: boolean;
  ordering?: string;
  page?: number;
  priority?: NotificationPriority;
  search?: string;
  type?: NotificationType;
}

// Audit Log Types
export type AuditLogActionType =
  | "admin_login"
  | "admin_logout"
  | "banner_create"
  | "banner_delete"
  | "banner_status_change"
  | "banner_update"
  | "blog_create"
  | "blog_delete"
  | "blog_publish_toggle"
  | "blog_update"
  | "category_create"
  | "category_delete"
  | "category_status_change"
  | "category_update"
  | "design_approve"
  | "design_reject"
  | "discount_bulk_action"
  | "discount_create"
  | "discount_delete"
  | "discount_status_change"
  | "discount_update"
  | "export_data"
  | "failed_login"
  | "order_cancel"
  | "order_status_update"
  | "password_reset_confirm"
  | "password_reset_request"
  | "permission_denied"
  | "product_bulk_action"
  | "product_create"
  | "product_delete"
  | "product_featured_toggle"
  | "product_status_change"
  | "product_update"
  | "profile_access"
  | "settings_update"
  | "suspicious_activity"
  | "team_member_list"
  | "testimonial_create"
  | "testimonial_delete"
  | "testimonial_status_change"
  | "testimonial_update"
  | "user_activate"
  | "user_create"
  | "user_delete"
  | "user_suspend"
  | "user_update";

export const AUDIT_LOG_ACTION_TYPES: AuditLogActionType[] = [
  "admin_login",
  "admin_logout",
  "banner_create",
  "banner_delete",
  "banner_status_change",
  "banner_update",
  "blog_create",
  "blog_delete",
  "blog_publish_toggle",
  "blog_update",
  "category_create",
  "category_delete",
  "category_status_change",
  "category_update",
  "design_approve",
  "design_reject",
  "discount_bulk_action",
  "discount_create",
  "discount_delete",
  "discount_status_change",
  "discount_update",
  "export_data",
  "failed_login",
  "order_cancel",
  "order_status_update",
  "password_reset_confirm",
  "password_reset_request",
  "permission_denied",
  "product_bulk_action",
  "product_create",
  "product_delete",
  "product_featured_toggle",
  "product_status_change",
  "product_update",
  "profile_access",
  "settings_update",
  "suspicious_activity",
  "team_member_list",
  "testimonial_create",
  "testimonial_delete",
  "testimonial_status_change",
  "testimonial_update",
  "user_activate",
  "user_create",
  "user_delete",
  "user_suspend",
  "user_update",
];

export interface AuditLog {
  id: number;
  timestamp: string;
  user_name: string;
  /** UUID of the user (for filtering) */
  user?: string;
  action_type: string;
  action_display: string;
  object_name: string;
  content_type_name?: string;
  success: boolean;
  ip_address: string;
  is_critical: boolean;
}

/** @deprecated Use UserActivityResponse for user_activity endpoint */
export interface UserIssue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  issueType: string;
  description: string;
  status: "pending" | "resolved" | "escalated";
  timestamp: string;
}

/** User activity / user_activity endpoint response */
export interface UserActivityStatistics {
  total_actions: number;
  critical_actions: number;
  failed_actions: number;
}

export interface UserActivityItemDetails {
  model?: string;
  admin_name?: string;
  admin_email?: string;
  timestamp_iso?: string;
  updated_fields?: string[];
  [key: string]: unknown;
}

export interface UserActivityItem {
  id: number;
  timestamp: string;
  user: string;
  user_email: string;
  user_name: string;
  action_type: string;
  action_display: string;
  content_type: number;
  object_id: string;
  content_type_name: string;
  object_name: string;
  details?: UserActivityItemDetails;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  error_message: string;
  is_critical: boolean;
}

export interface UserActivityResponse {
  user_id: string;
  statistics: UserActivityStatistics;
  recent_activity: UserActivityItem[];
}

export interface GetAuditLogsParams {
  search?: string;
  /** UUID of the user */
  user?: string;
  action_type?: AuditLogActionType;
  success?: boolean;
  is_critical?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  ordering?: string;
}

/** GET /dashboard/audit-logs/{id}/ response */
export interface AuditLogDetailDetails {
  admin_name?: string;
  admin_email?: string;
  user_agent?: string;
  login_method?: string;
  login_success?: boolean;
  timestamp_iso?: string;
  username_used?: string;
  updated_fields?: string[];
  amount?: number | string;
  model?: string;
  [key: string]: unknown;
}

export interface AuditLogDetail {
  id: number;
  timestamp: string;
  user: string | null;
  user_name: string;
  action_type: string;
  action_display: string;
  content_type: number;
  object_id: string;
  content_type_name: string;
  object_name: string;
  details?: AuditLogDetailDetails;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  error_message: string;
  is_critical: boolean;
}
