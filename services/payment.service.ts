import makeRequest from '@/lib/api';

export type PaymentMethod = 'paystack' | 'nova' | 'payaza';

export interface PaymentInitializeResponse {
  authorization_url?: string;
  access_code?: string;
  reference: string;
  payment_url?: string;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failed' | 'pending';
  order_id: number;
  order_number: string;
  amount: string;
  reference: string;
}

export interface PayazaVerifyResponse {
  id: number;
  order: number;
  amount: string;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface OrderItem {
  product_id?: number;
  quantity: number;
  color: string;
  size: string;
  customization?: any;
}

interface OrderCreateData {
  payment_method: PaymentMethod;
  shipping_address_id?: number;
  shipping_address?: ShippingAddress;
  items?: OrderItem[];
  email?: string;
}

class PaymentService {
  async createOrder(token: string | undefined, orderData: OrderCreateData): Promise<any> {
    try {
      const response = await makeRequest({
        url: 'orders/',
        method: 'POST',
        requireToken: !!token,
        token,
        data: orderData,
      });

      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async initializePayment(
    orderId: number,
    paymentMethod: PaymentMethod,
    email: string,
    token?: string
  ): Promise<PaymentInitializeResponse> {
    try {
      const response = await makeRequest({
        url: 'payments/initialize/',
        method: 'POST',
        requireToken: !!token,
        token,
        data: {
          order_id: orderId,
          payment_method: paymentMethod,
          email: email,
        },
      });

      return response;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string, token?: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await makeRequest({
        url: `payments/verify/?reference=${reference}`,
        method: 'GET',
        requireToken: !!token,
        token,
      });

      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }


  async verifyPayazaPayment(reference: string, token?: string): Promise<PayazaVerifyResponse> {
    try {
      const response = await makeRequest({
        url: 'payments/verify-payaza/',
        method: 'POST',
        requireToken: !!token,
        token,
        data: {
          reference: reference,
        },
      });

      return response;
    } catch (error) {
      console.error('Error verifying Payaza payment:', error);
      throw error;
    }
  }

  async checkout(
    orderData: OrderCreateData,
    token?: string
  ): Promise<{ order: any; paymentUrl: string }> {
    try {
      const order = await this.createOrder(token, orderData);
            const email = orderData.email || order.guest_email || order.user?.email;
      
      if (!email) {
        throw new Error('Email is required for payment initialization');
      }

      const payment = await this.initializePayment(
        order.id,
        orderData.payment_method,
        email,
        token
      );

      const paymentUrl = payment.authorization_url || payment.payment_url || '';

      if (!paymentUrl) {
        throw new Error('No payment URL received from payment gateway');
      }

      return {
        order,
        paymentUrl,
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }

  async createOrderForPayaza(
    orderData: OrderCreateData,
    token?: string
  ): Promise<{ order: any; reference: string }> {
    try {
      const order = await this.createOrder(token, orderData);

      const reference = order.payment_reference || order.order_number;
      
      if (!reference) {
        throw new Error('No payment reference received from backend');
      }

      return {
        order,
        reference,
      };
    } catch (error) {
      console.error('Error creating order for Payaza:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();