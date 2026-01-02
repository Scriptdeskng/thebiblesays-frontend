import makeRequest from '@/lib/api';

interface ApiCartItem {
  id: number;
  product_variant: {
    id: number;
    product: {
      id: number;
      name: string;
      slug: string;
      featured_image: string;
    };
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
  quantity: number;
  total_price: string;
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
  async getCart(token?: string): Promise<ApiCart | null> {
    try {
      if (token) {
        const response = await makeRequest({
          url: 'cart/',
          method: 'GET',
          requireToken: true,
          token,
        });
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  async addToCart(
    token: string | undefined,
    productVariantId: number,
    quantity: number
  ): Promise<ApiCart> {
    try {
      const response = await makeRequest({
        url: 'cart/add/',
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
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(
    token: string,
    itemId: number,
    quantity: number
  ): Promise<ApiCart> {
    try {
      const response = await makeRequest({
        url: `cart/update/${itemId}/`,
        method: 'PUT',
        requireToken: true,
        token,
        data: { quantity },
      });

      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(token: string, itemId: number): Promise<void> {
    try {
      await makeRequest({
        url: `cart/remove/${itemId}/`,
        method: 'DELETE',
        requireToken: true,
        token,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(token: string): Promise<void> {
    try {
      const cart = await this.getCart(token);
      if (cart && cart.items.length > 0) {
        await Promise.all(
          cart.items.map(item => this.removeFromCart(token, item.id))
        );
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();