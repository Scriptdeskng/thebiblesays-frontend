import makeRequest, { API_URL } from "@/lib/api";
import {
  DashboardOverview,
  ApiProduct,
  GetProductsParams,
  ApiCategory,
  ApiProductDetail,
} from "@/types/admin.types";
import { useAuthStore } from "@/store/useAuthStore";

class DashboardService {
  async getOverview(dateFilter?: string): Promise<DashboardOverview> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const params: Record<string, any> = {};
      if (dateFilter) {
        params.date_filter = dateFilter;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/overview/`,
        method: "GET",
        params,
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  }

  async getProducts(params?: GetProductsParams): Promise<ApiProduct[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.category !== undefined) {
        queryParams.category = params.category;
      }
      if (params?.is_active !== undefined) {
        queryParams.is_active = params.is_active;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.page !== undefined) {
        queryParams.page = params.page;
      }
      if (params?.search) {
        queryParams.search = params.search;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/products/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      // API now returns array directly instead of paginated response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getCategories(): Promise<ApiCategory[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/categories/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<ApiProductDetail> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/products/${id}/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
