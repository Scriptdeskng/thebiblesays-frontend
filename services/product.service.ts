import { Product, Review } from '@/types/product.types';
import { mockProducts, mockReviews } from '@/lib/mockData';

class ProductService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  async getProducts(): Promise<Product[]> {
    try {
      return mockProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = mockProducts.find(p => p.id === id);
      return product || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      return mockProducts.filter(p => p.isFeatured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  async getBestsellers(): Promise<Product[]> {
    try {
      return mockProducts.filter(p => p.isBestseller);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return mockProducts.filter(p => p.category === category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const product = mockProducts.find(p => p.id === productId);
      if (!product) return [];
      
      return mockProducts
        .filter(p => p.id !== productId && p.category === product.category)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }

  async getReviews(productId: string): Promise<Review[]> {
    try {
      return mockReviews.filter(r => r.productId === productId);
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