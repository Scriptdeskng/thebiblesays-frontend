import makeRequest from '@/lib/api';

export type PaymentMethod = 'paystack' | 'nova' | 'payaza' | 'stripe';

export interface PaymentInitializeResponse {
  id?: number;
  order?: number;
  amount?: string;
  reference?: string;
  status?: 'pending' | 'success' | 'failed';
  payment_method?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  authorization_url?: string;
  access_code?: string;
  payment_url?: string;
  session_id?: string;
  stripe_session_id?: string;
  stripe_session_url?: string;
  data?: {
    reference?: string;
    transaction_reference?: string;
    amount?: number;
    currency?: string;
    email_address?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    callback_url?: string;
    description?: string;
    service_type?: string;
    authorization_url?: string;
    access_code?: string;
    payment_url?: string;
    stripe_session_id?: string;
    stripe_session_url?: string;
    session_id?: string;
    customer_id?: string;
    stripe_currency?: string;
    stripe_amount_cents?: number;
  };
  message?: string;
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
  shipping_address: ShippingAddress;
  items?: OrderItem[];
  email?: string;
}

class PaymentService {
  private normalizePaymentResponse(response: any): PaymentInitializeResponse {
  if (response.data && typeof response.data === 'object') {
    return {
      ...response,
      ...response.data,
    };
  }
  return response;
}

  async createOrder(
    token: string | undefined,
    orderData: OrderCreateData,
    currencyParam: string = ''
  ): Promise<any> {

    try {
      const response = await makeRequest({
        url: `orders/${currencyParam}`,
        method: 'POST',
        requireToken: !!token,
        token,
        data: orderData,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async initializePayment(
    orderId: number,
    paymentMethod: PaymentMethod,
    email: string,
    token?: string,
    currencyParam: string = ''
  ): Promise<PaymentInitializeResponse> {
    try {
      const response = await makeRequest({
        url: `payments/initialize/${currencyParam}`,
        method: 'POST',
        requireToken: !!token,
        token,
        data: {
          order_id: orderId,
          payment_method: paymentMethod,
          email: email,
        },
      });

      return this.normalizePaymentResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(
    reference: string,
    token?: string,
    currencyParam: string = ''
  ): Promise<PaymentVerifyResponse> {
    try {
      const response = await makeRequest({
        url: `payments/verify/${currencyParam}&reference=${reference}`,
        method: 'GET',
        requireToken: !!token,
        token,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

    async verifyPayazaPayment(
    reference: string,
    token?: string
  ): Promise<PayazaVerifyResponse> {
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
    } catch (error: any) {
      throw error;
    }
  }

  async verifyStripePayment(
    sessionId: string,
    token?: string,
    currencyParam: string = ''
  ): Promise<PaymentVerifyResponse> {
    try {
      const response = await makeRequest({
        url: `payments/verify-general/${currencyParam}`,
        method: 'POST',
        requireToken: !!token,
        token,
        data: {
          session_id: sessionId,
          payment_method: 'stripe',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkout(
    orderData: OrderCreateData,
    token?: string,
    currencyParam: string = ''
  ): Promise<{ order: any; paymentUrl: string; sessionId?: string }> {
    try {
      const order = await this.createOrder(token, orderData, currencyParam);
      const email = orderData.email || order.guest_email || order.user?.email;

      if (!email) {
        throw new Error('Email is required for payment initialization');
      }

      const payment = await this.initializePayment(
        order.id,
        orderData.payment_method,
        email,
        token,
        currencyParam
      );

      let paymentUrl = '';

      if (orderData.payment_method === 'stripe') {
        paymentUrl = payment.data?.authorization_url ||
          payment.data?.stripe_session_url ||
          payment.authorization_url ||
          payment.stripe_session_url || '';
      } else {
        paymentUrl = payment.data?.authorization_url ||
          payment.data?.payment_url ||
          payment.authorization_url ||
          payment.payment_url || '';
      }

      if (!paymentUrl) {
        throw new Error('No payment URL received from payment gateway');
      }

      return {
        order,
        paymentUrl,
        sessionId: payment.data?.session_id ||
          payment.data?.stripe_session_id ||
          payment.stripe_session_id ||
          payment.session_id,
      };
    } catch (error) {
      throw error;
    }
  }

  async createOrderAndInitializePayaza(
    orderData: OrderCreateData,
    token?: string,
    currencyParam: string = ''
  ): Promise<{
    order: any;
    payment: PaymentInitializeResponse;
    transactionReference: string;
    backendReference?: string;
    callbackUrl?: string;
  }> {
    try {
      const order = await this.createOrder(token, orderData, currencyParam);

      const email = orderData.email || order.guest_email || order.user?.email;

      if (!email) {
        throw new Error('Email is required for payment initialization');
      }

      const payment = await this.initializePayment(
        order.id,
        orderData.payment_method,
        email,
        token,
        currencyParam
      );

      const backendReference = payment.data?.reference ||
        payment.reference ||
        null;

      const transactionReference = order.order_number;

      if (!transactionReference) {
        throw new Error('No order number received from backend');
      }

      const callbackUrl = payment.data?.callback_url;

      return {
        order,
        payment,
        transactionReference,
        backendReference: backendReference || undefined,
        callbackUrl,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const paymentService = new PaymentService();