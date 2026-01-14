import makeRequest from '@/lib/api';

interface ApiWishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    featured_image: string;
  };
  min_price: string;
  max_price: string;
  price_range: string;
  is_on_sale: string;
  created_at: string;
}

class WishlistService {
  async getWishlist(token: string, currencyParam: string = ''): Promise<ApiWishlistItem[]> {
    try {
      const response = await makeRequest({
        url: `products/wishlist/${currencyParam}`,
        method: 'GET',
        requireToken: true,
        token,
      });

      return response.results || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);

      if ((error as any)?.response?.status === 500) {
        console.error('Backend error - check server logs');
      }

      return [];
    }
  }

  async addToWishlist(
    token: string, 
    productId: number,
    currencyParam: string = ''
  ): Promise<ApiWishlistItem> {
    try {
      const response = await makeRequest({
        url: `products/wishlist/${currencyParam}`,
        method: 'POST',
        requireToken: true,
        token,
        data: {
          product_id: productId,
        },
      });

      return response;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(
    token: string, 
    wishlistItemId: number,
    currencyParam: string = ''
  ): Promise<void> {
    try {
      await makeRequest({
        url: `products/wishlist/${wishlistItemId}/${currencyParam}`,
        method: 'DELETE',
        requireToken: true,
        token,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  async isInWishlist(
    token: string, 
    productId: number,
    currencyParam: string = ''
  ): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist(token, currencyParam);
      return wishlist.some(item => item.product.id === productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }
}

export const wishlistService = new WishlistService();