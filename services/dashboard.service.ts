import makeRequest, { API_URL } from "@/lib/api";
import {
  DashboardOverview,
  ApiProduct,
  GetProductsParams,
  ApiCategory,
  ApiProductDetail,
  ApiOrder,
  ApiUser,
} from "@/types/admin.types";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

class DashboardService {
  async getOverview(
    dateFilter?: string,
    dateRange?: [Date | null, Date | null]
  ): Promise<DashboardOverview> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const params: Record<string, any> = {};

      // Add date_filter for predefined filters (monthly, daily, etc.)
      if (dateFilter) {
        params.date_filter = dateFilter;
      }

      // Add start_date and end_date as separate parameters if date range is provided
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].toISOString().split("T")[0]; // Format as YYYY-MM-DD
        const endDate = dateRange[1].toISOString().split("T")[0]; // Format as YYYY-MM-DD

        params.start_date = startDate;
        params.end_date = endDate;
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

  async getOrders(params?: {
    search?: string;
    ordering?: string;
    status?: string;
  }): Promise<ApiOrder[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.status) {
        queryParams.status = params.status;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/orders/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly (similar to products)
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(id: string | number): Promise<ApiOrder> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/orders/${id}/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async updateOrderStatus(
    id: string | number,
    status: string
  ): Promise<{ message: string; status: string }> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/orders/${id}/update_status/`,
        method: "POST",
        requireToken: true,
        token: accessToken,
        data: { status },
      });

      return response;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  async exportOrders(params?: {
    search?: string;
    ordering?: string;
    status?: string;
  }): Promise<Blob> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.status) {
        queryParams.status = params.status;
      }

      // Use axios directly for file downloads with blob response type
      const response = await axios.get(`${API_URL}/dashboard/orders/export/`, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",
      });

      return response.data;
    } catch (error) {
      console.error("Error exporting orders:", error);
      throw error;
    }
  }

  async getUsers(params?: {
    search?: string;
    ordering?: string;
    is_active?: boolean;
  }): Promise<ApiUser[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.is_active !== undefined) {
        queryParams.is_active = params.is_active;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/users/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly (similar to products and orders)
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getCustomMerch(params?: {
    search?: string;
    ordering?: string;
    status?: string;
  }): Promise<any[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.status) {
        queryParams.status = params.status;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/byom-designs/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly (similar to products and orders)
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching custom merch:", error);
      throw error;
    }
  }

  async exportUsers(params?: {
    search?: string;
    ordering?: string;
    is_active?: boolean;
  }): Promise<Blob> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.is_active !== undefined) {
        queryParams.is_active = params.is_active;
      }

      // Use axios directly for file downloads with blob response type
      const response = await axios.get(
        `${API_URL}/dashboard/users/export_users/`,
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error exporting users:", error);
      throw error;
    }
  }

  async getCustomMerchById(id: string | number): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/byom-designs/${id}/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching custom merch by id:", error);
      throw error;
    }
  }

  async approveCustomMerch(id: string | number): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/byom-designs/${id}/approve_design/`,
        method: "POST",
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error approving custom merch:", error);
      throw error;
    }
  }

  async rejectCustomMerch(
    id: string | number,
    rejectionReason?: string
  ): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const data: Record<string, any> = {};
      if (rejectionReason) {
        data.rejection_reason = rejectionReason;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/byom-designs/${id}/reject_design/`,
        method: "POST",
        requireToken: true,
        token: accessToken,
        data,
      });

      return response;
    } catch (error) {
      console.error("Error rejecting custom merch:", error);
      throw error;
    }
  }

  async exportCustomMerch(): Promise<Blob> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Use axios directly for file downloads with blob response type
      const response = await axios.get(
        `${API_URL}/dashboard/byom-designs/export/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error exporting custom merch:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
