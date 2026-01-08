import {
  Product,
  Order,
  User,
  CustomMerch,
  Transaction,
  Settlement,
  SupportTicket,
  DiscountCode,
  LoyaltyPoint,
  Promotion,
  ShippingRegion,
  Role,
  TeamMember,
  DashboardStats,
  SalesData,
  ProductColor,
} from '@/types/admin.types';

export const AVAILABLE_COLORS: ProductColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF4136' },
  { name: 'Blue', hex: '#0074D9' },
  { name: 'Green', hex: '#2ECC40' },
  { name: 'Yellow', hex: '#FFDC00' },
];

export const mockDashboardStats: DashboardStats = {
  totalSales: 2500000,
  totalSalesChange: 10.5,
  totalOrders: 450,
  totalOrdersChange: 8.2,
  customMerch: 85,
  customMerchChange: 20.0,
  usersRegistered: 1250,
  usersRegisteredChange: 15.5,
};

export const mockSalesData: SalesData[] = [
  { month: 'Jan', amount: 150000 },
  { month: 'Feb', amount: 180000 },
  { month: 'Mar', amount: 220000 },
  { month: 'Apr', amount: 195000 },
  { month: 'May', amount: 240000 },
  { month: 'Jun', amount: 280000 },
  { month: 'Jul', amount: 310000 },
  { month: 'Aug', amount: 290000 },
  { month: 'Sep', amount: 330000 },
  { month: 'Oct', amount: 360000 },
  { month: 'Nov', amount: 385000 },
  { month: 'Dec', amount: 420000 },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Faith Over Fear T-Shirt',
    category: 'Shirts',
    price: 5500,
    stock: 120,
    description: 'Premium cotton t-shirt with inspiring faith message',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: AVAILABLE_COLORS.slice(0, 4),
    image: '/products/cover2.png',
    status: 'Active',
    sales: 245,
    revenue: 1347500,
    createdAt: '2024-12-01',
  },
  {
    id: '2',
    name: 'Grace Embroidered Cap',
    category: 'Caps',
    price: 3500,
    stock: 85,
    description: 'Stylish cap with Grace embroidery',
    sizes: ['M', 'L'],
    colors: AVAILABLE_COLORS.slice(0, 3),
    image: '/products/cover.png',
    status: 'Active',
    sales: 180,
    revenue: 630000,
    createdAt: '2024-11-15',
  },
  {
    id: '3',
    name: 'Blessed Hoodie',
    category: 'Hoodie',
    price: 12000,
    stock: 45,
    description: 'Comfortable hoodie perfect for worship nights',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: AVAILABLE_COLORS.slice(0, 5),
    image: '/products/cover1.png',
    status: 'Active',
    sales: 95,
    revenue: 1140000,
    createdAt: '2024-10-20',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    items: [
      {
        productId: '1',
        productName: 'Faith Over Fear T-Shirt',
        category: 'Shirts',
        quantity: 2,
        price: 5500,
      },
    ],
    totalAmount: 11000,
    status: 'delivered',
    paymentMethod: 'paystack',
    paymentStatus: 'completed',
    deliveryAddress: '123 Lagos Street, Lagos, Nigeria',
    orderDate: '2025-01-01',
    createdAt: '2025-01-01T10:30:00Z',
  },
  {
    id: 'ORD-2024-002',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    items: [
      {
        productId: '3',
        productName: 'Blessed Hoodie',
        category: 'Hoodie',
        quantity: 1,
        price: 12000,
      },
    ],
    totalAmount: 12000,
    status: 'processing',
    paymentMethod: 'flutterwave',
    paymentStatus: 'completed',
    deliveryAddress: '456 Abuja Road, Abuja, Nigeria',
    orderDate: '2025-01-02',
    createdAt: '2025-01-02T14:20:00Z',
  },
  {
    id: 'ORD-2025-002',
    userId: 'user4',
    userName: 'Juliet Smith',
    userEmail: 'jul@example.com',
    items: [
      {
        productId: '3',
        productName: 'Blessed Hoodie',
        category: 'Hoodie',
        quantity: 1,
        price: 12000,
      },
    ],
    totalAmount: 12000,
    status: 'pending',
    paymentMethod: 'flutterwave',
    paymentStatus: 'completed',
    deliveryAddress: '456 Abuja Road, Abuja, Nigeria',
    orderDate: '2025-01-02',
    createdAt: '2025-01-02T14:20:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    image: '/avatars/user1.jpg',
    role: 'admin',
    status: 'active',
    ordersCount: 15,
    amountSpent: 125000,
    lastActive: '2025-01-02',
    createdAt: '2024-06-15',
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    status: 'active',
    ordersCount: 8,
    amountSpent: 75000,
    lastActive: '2025-01-01',
    createdAt: '2024-08-20',
  },
];

export const mockCustomMerch: CustomMerch[] = [
  {
    id: 'CM-001',
    designName: 'Church Anniversary Design',
    designId: 'DES-2024-001',
    creator: 'Pastor Mike',
    creatorId: 'user3',
    productType: 'Shirts',
    image: '/byom/hoodie.png',
    customText: 'Church Anniversary 2024',
    amount: 7500,
    quantity: 50,
    status: 'pending',
    dateCreated: '2024-12-28',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    amount: 11000,
    method: 'paystack',
    status: 'completed',
    dateTime: '2025-01-01T10:30:00Z',
  },
];

export const mockSettlements: Settlement[] = [
  {
    id: 'SET-001',
    gateway: 'paystack',
    grossAmount: 500000,
    gatewayFee: 7500,
    netPayout: 492500,
    settlementDate: '2024-12-31',
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'TICKET-001',
    orderId: 'ORD-2024-001',
    title: 'Delayed Delivery',
    customerName: 'John Doe',
    customerId: 'user1',
    customerEmail: 'john@example.com',
    description: 'My order has not arrived after 5 days',
    status: 'pending',
    date: '2025-01-02',
  },
];

export const mockDiscountCodes: DiscountCode[] = [
  {
    id: 'DISC-001',
    code: 'NEWYEAR2025',
    type: 'percentage',
    value: 20,
    usage: 45,
    usageLimit: 100,
    expiryDate: '2025-01-31',
    status: 'active',
  },
];

export const mockLoyaltyPoints: LoyaltyPoint[] = [
  {
    id: 'LP-001',
    purchaseAmount: 1,
    pointsPerPurchase: 5,
    referralBonus: 100,
    birthdayBonus: 50,
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: 'PROMO-001',
    name: 'New Year Sale',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    discount: 25,
  },
];

export const mockShippingRegions: ShippingRegion[] = [
  {
    id: 'SHIP-001',
    region: 'Lagos',
    deliveryFee: 2000,
    timeline: '1-2 days',
    status: 'active',
  },
  {
    id: 'SHIP-002',
    region: 'Abuja',
    deliveryFee: 2500,
    timeline: '2-3 days',
    status: 'active',
  },
];

export const mockRoles: Role[] = [
  {
    id: 'ROLE-001',
    name: 'Admin',
    membersAssigned: 2,
    permissionCount: 15,
    permissions: ['all'],
    status: 'active',
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'TEAM-001',
    name: 'Admin User',
    email: 'admin@churchmerch.com',
    role: 'Admin',
    lastActive: '2025-01-02',
    status: 'active',
  },
];

export const apiService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardStats;
  },

  getSalesData: async (): Promise<SalesData[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSalesData;
  },

  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts.find(p => p.id === id);
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      name: product.name || '',
      category: product.category || 'Shirts',
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      image: product.image || '',
      status: product.status || 'Active',
      sales: product.sales || 0,
      revenue: product.revenue || 0,
      createdAt: new Date().toISOString(),
    };
    return newProduct;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockProducts[0], ...product };
  },

  deleteProduct: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  getOrders: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  },

  getOrder: async (id: string): Promise<Order | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.find(o => o.id === id);
  },

  updateOrderStatus: async (id: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  updateUserStatus: async (id: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
  },

  getSupportTickets: async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSupportTickets;
  },

  getCustomMerch: async (): Promise<CustomMerch[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCustomMerch;
  },

  updateCustomMerchStatus: async (id: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};
