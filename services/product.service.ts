import { Product, Review } from '@/types/product.types';
import makeRequest from '@/lib/api';
import { COLORS, SIZES } from '@/constants/variants';

interface ApiProduct {
  id: number;
  name: string;
  slug: string;

  category: {
    id: number;
    name: string;
    slug: string;
  };

  subcategory?: {
    id: number;
    name: string;
    slug: string;
  };

  description: string;
  price: string;
  is_on_sale: boolean;
  average_rating: string;
  review_count: number;
  sold_count: number;
  images: Array<{
    id: number;
    image: string;
    is_featured: boolean;
  }>;
  created_at: string;
}

/**
 * NOTE:
 * Colors and sizes are platform-wide constants.
 * Backend does not provide variants.
 * All products are assumed to support all sizes & colors.
 */
class ProductService {
  private transformProduct(apiProduct: ApiProduct): Product {
    const colors = COLORS;
    const sizes = SIZES;

    const inStock = true;

    return {
      id: apiProduct.id.toString(),
      name: apiProduct.name,
      slug: apiProduct.slug,
      category: apiProduct.category.name as any,
      subcategory: apiProduct.subcategory?.name,
      description: apiProduct.description,
      price: parseFloat(apiProduct.price) || 0,
      images: apiProduct.images.map(img => ({
        url: img.image,
        alt: apiProduct.name,
        color: colors[0]?.name,
      })),
      colors,
      sizes,
      inStock,
      isFeatured: apiProduct.is_on_sale,
      isBestseller: apiProduct.sold_count > 0,
      rating: parseFloat(apiProduct.average_rating) || 0,
      reviewCount: apiProduct.review_count,
      features: [],
    };
  }

  async getProducts(currencyParam: string = ''): Promise<Product[]> {
    try {
      const response = await makeRequest({
        url: `products/products/${currencyParam}`,
        method: 'GET',
      });

      const list = Array.isArray(response) ? response : (response?.results || []);

      return list.map((p: ApiProduct) => this.transformProduct(p));

    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductBySlug(slug: string, currencyParam: string = ''): Promise<Product | null> {
    try {
      const response = await makeRequest({
        url: `products/products/${slug}/${currencyParam}`,
        method: 'GET',
      });

      return this.transformProduct(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getFeaturedProducts(currencyParam: string = ''): Promise<Product[]> {
    try {
      const response = await makeRequest({
        url: `products/products/recommended/${currencyParam}`,
        method: 'GET',
        params: { is_featured: true },
      });

      const list = Array.isArray(response) ? response : (response?.results || []);
      return list.map((p: ApiProduct) => this.transformProduct(p));

    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  async getBestsellers(currencyParam: string = ''): Promise<Product[]> {
    try {
      const response = await makeRequest({
        url: `products/products/bestsellers/${currencyParam}`,
        method: 'GET',
      });

      if (Array.isArray(response)) {
        return response.map((p: ApiProduct) => this.transformProduct(p));
      }

      const list = response?.results || [];
      return list.map((p: ApiProduct) => this.transformProduct(p));
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  }

  async getProductsByCategory(category: string, currencyParam: string = ''): Promise<Product[]> {
    try {
      const response = await makeRequest({
        url: `products/products/${currencyParam}`,
        method: 'GET',
        params: { category },
      });

      const list = Array.isArray(response) ? response : (response?.results || []);
      return list.map((p: ApiProduct) => this.transformProduct(p));

    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4, currencyParam: string = ''): Promise<Product[]> {
    try {
      const product = await this.getProductBySlug(productId, currencyParam);
      if (!product) return [];

      const response = await makeRequest({
        url: `products/products/${currencyParam}`,
        method: 'GET',
        params: { category: product.category },
      });

      const list = Array.isArray(response) ? response : (response?.results || []);

      return list
        .filter((p: ApiProduct) => p.id.toString() !== productId)
        .slice(0, limit)
        .map((p: ApiProduct) => this.transformProduct(p));

    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }

  async getReviews(productId: string): Promise<Review[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const newReview: Review = {
        ...review,
        id: `r${Date.now()}`,
        createdAt: new Date(),
      };
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();