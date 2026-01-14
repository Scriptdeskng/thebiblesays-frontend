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
  async getOrders(
    token: string,
    params?: {
      page?: number;
      search?: string;
      ordering?: string;
    },
    currencyParam: string = ''
  ): Promise<OrderListResponse> {
    try {
      const response = await makeRequest({
        url: `orders/${currencyParam}`,
        method: 'GET',
        requireToken: true,
        token,
        params,
      });

      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getMyOrders(
    token: string,
    params?: {
      page?: number;
      search?: string;
      ordering?: string;
    },
    currencyParam: string = ''
  ): Promise<OrderListResponse> {
    try {
      const response = await makeRequest({
        url: `orders/my_orders/${currencyParam}`,
        method: 'GET',
        requireToken: true,
        token,
        params,
      });

      return response;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  }

  async getOrderById(
    token: string, 
    orderId: number,
    currencyParam: string = ''
  ): Promise<Order> {
    try {
      const response = await makeRequest({
        url: `orders/${orderId}/${currencyParam}`,
        method: 'GET',
        requireToken: true,
        token,
      });

      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrderByNumber(
    token: string, 
    orderNumber: string,
    currencyParam: string = ''
  ): Promise<Order | null> {
    try {
      const response = await this.getMyOrders(token, { search: orderNumber }, currencyParam);
      
      if (response.results && response.results.length > 0) {
        return response.results[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      return null;
    }
  }

  getStatusColor(status: Order['status']): string {
    const colors: Record<Order['status'], string> = {
      placed: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  calculateOrderTotals(order: Order) {
    return {
      subtotal: parseFloat(order.subtotal),
      shipping: parseFloat(order.shipping_fee),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      currency: order.currency || 'NGN',
    };
  }
}

export const orderService = new OrderService();