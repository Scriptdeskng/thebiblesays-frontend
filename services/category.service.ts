import makeRequest from '@/lib/api';

interface ApiSubcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: number;
  product_count: string;
}

interface ApiCategory {
  id: number;
  name: string;
  image: string;
  slug: string;
  description: string;
  product_count: string;
  subcategories: ApiSubcategory[] | string;
}

class CategoryService {
  async getCategories(params?: { page?: number; search?: string }): Promise<{ results: ApiCategory[]; count: number }> {
    try {
      const response = await makeRequest({
        url: 'products/categories/',
        method: 'GET',
        params,
      });

      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { results: [], count: 0 };
    }
  }

  async getCategoryBySlug(slug: string): Promise<ApiCategory | null> {
    try {
      const response = await makeRequest({
        url: `products/categories/${slug}/`,
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async getCategoryProducts(slug: string): Promise<any> {
    try {
      const response = await makeRequest({
        url: `products/categories/${slug}/products/`,
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Error fetching category products:', error);
      return null;
    }
  }

  async getAllCategories(): Promise<ApiCategory[]> {
    try {
      const response = await this.getCategories();
      return response.results;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  }
}

export const categoryService = new CategoryService();