import makeRequest from '@/lib/api';

export interface OrderItem {
  id: number;
  product_variant: {
    id: number;
    product: number;
    color: {
      id: number;
      name: string;
      hex_code: string;
    };
    size: {
      id: number;
      name: string;
    };
    sku: string;
    stock: number;
    current_price: string;
  };
  product_name: string;
  color: string;
  size: string;
  price: string;
  quantity: number;
  total_price: string;
  backordered: boolean;
  backordered_quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  status_display: string;
  user: string;
  guest_email: string | null;
  payment_method: string;
  subtotal: string;
  shipping_fee: string;
  tax: string;
  total: string;
  currency: 'NGN' | 'USD';
  created_at: string;
  estimated_delivery: string;
  items: OrderItem[];
  shipping_address: string;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

class OrderService {
  async getAllOrders(token: string): Promise<any> {
    try {
      const response = await makeRequest({
        url: 'orders/',
        method: 'GET',
        requireToken: true,
        token,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

    async getMyOrders(
    token: string
  ): Promise<any> {
    try {
      const response = await makeRequest({
        url: `orders/my_orders/`,
        method: 'GET',
        requireToken: true,
        token,
      });

      return response;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string, token?: string): Promise<any> {
    try {
      const response = await makeRequest({
        url: `orders/${orderNumber}/`,
        method: 'GET',
        requireToken: !!token,
        token,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const orderService = new OrderService();