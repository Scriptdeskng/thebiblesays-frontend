import makeRequest from '@/lib/api';

interface ApiCartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price?: string;
    color?: string;
    size?: string;
    category?: {
      id: number;
      name: string;
    };
    subcategory?: any;
    tags?: any[];
    colors?: any[];
    stock_level?: number;
    images?: Array<{
      id: number;
      image: string;
      is_featured: boolean;
    }>;
    featured_image?: string;
    created_at?: string;
  };
    custom_merch_design?: {
    id: number;
    name: string;
    color: string;
    size: string;
    configuration_json: string;
    total_customization_cost: string;
    product_detail: {
      id: number;
      name: string;
      slug: string;
      featured_image: string;
    };
  };
  quantity: number;
  total_price: string;
  is_customized: boolean | string;
  customization_cost?: string;
  customization_info?: string | any;
}

interface ApiCart {
  id: number;
  items: ApiCartItem[];
  item_count: string;
  total: string;
  created_at: string;
  updated_at: string;
}

class CartService {
  async getCart(token: string, cartId: number, currencyParam: string = ''): Promise<ApiCart | null> {
    try {
      const response = await makeRequest({
        url: `cart/${cartId}/${currencyParam}`, 
        method: 'GET',
        requireToken: true,
        token,
      });
      return response;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  async addToCart(
    token: string | undefined,
    productVariantId: number,
    quantity: number,
    currencyParam: string = ''
  ): Promise<ApiCart> {
    try {
      const response = await makeRequest({
        url: `cart/add/${currencyParam}`,
        method: 'POST',
        requireToken: !!token,
        token,
        data: {
          product_variant_id: productVariantId,
          quantity,
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateCartItem(
    token: string,
    itemId: number,
    quantity: number,
    currencyParam: string = ''
  ): Promise<ApiCart> {
    try {
      const response = await makeRequest({
        url: `cart/update/${itemId}/${currencyParam}`,
        method: 'PUT',
        requireToken: true,
        token,
        data: { quantity },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async removeFromCart(
    token: string, 
    itemId: number,
    currencyParam: string = ''
  ): Promise<void> {
    try {
      await makeRequest({
        url: `cart/remove/${itemId}/${currencyParam}`,
        method: 'DELETE',
        requireToken: true,
        token,
      });
    } catch (error) {
      throw error;
    }
  }

  async clearCart(token: string, cartId: number, currencyParam: string = ''): Promise<void> {
    try {
      const cart = await this.getCart(token, cartId, currencyParam);
      if (cart && cart.items.length > 0) {
        await Promise.all(
          cart.items.map(item => this.removeFromCart(token, item.id, currencyParam))
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

export const cartService = new CartService();