import makeRequest, { API_URL } from "@/lib/api";
import {
  DashboardOverview,
  ApiProduct,
  GetProductsParams,
  ApiCategory,
  ApiProductDetail,
  ApiOrder,
  ApiUser,
  ApiTransaction,
  RevenueAnalytics,
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

  async getSubcategories(categoryId?: number): Promise<Array<{ id: number; name: string; category: number }>> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const params: Record<string, any> = {};
      if (categoryId) {
        params.category = categoryId;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/subcategories/`,
        method: "GET",
        params,
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching subcategories:", error);
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

  async getUserById(id: string | number): Promise<ApiUser> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/users/${id}/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async suspendUser(id: string | number, email: string, is_active: boolean): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/users/${id}/suspend_user/`,
        method: "POST",
        requireToken: true,
        token: accessToken,
        data: {
          email,
          is_active,
        },
      });

      return response;
    } catch (error) {
      console.error("Error suspending user:", error);
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

  async getTeamMembers(): Promise<any[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/settings/team/`,
        method: "GET",
        requireToken: true,
        token: accessToken,
      });

      // API returns object with results array
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }
      // Fallback: if response is already an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  }

  async createTeamMember(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'superuser';
  }): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/settings/team/`,
        method: "POST",
        requireToken: true,
        token: accessToken,
        data,
      });

      return response;
    } catch (error) {
      console.error("Error creating team member:", error);
      throw error;
    }
  }

  async getTransactions(params?: {
    search?: string;
    status?: string;
    payment_method?: string;
    ordering?: string;
    date_filter?: string;
  }): Promise<ApiTransaction[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.status) {
        queryParams.status = params.status;
      }
      if (params?.payment_method) {
        queryParams.payment_method = params.payment_method;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.date_filter) {
        queryParams.date_filter = params.date_filter;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/transactions/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      // API returns array directly (similar to products and orders)
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  async exportTransactions(params?: {
    search?: string;
    status?: string;
    payment_method?: string;
    ordering?: string;
    date_filter?: string;
    start_date?: string;
    end_date?: string;
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
      if (params?.status) {
        queryParams.status = params.status;
      }
      if (params?.payment_method) {
        queryParams.payment_method = params.payment_method;
      }
      if (params?.ordering) {
        queryParams.ordering = params.ordering;
      }
      if (params?.date_filter) {
        queryParams.date_filter = params.date_filter;
      }
      if (params?.start_date) {
        queryParams.start_date = params.start_date;
      }
      if (params?.end_date) {
        queryParams.end_date = params.end_date;
      }

      // Use axios directly for file downloads with blob response type
      const response = await axios.get(
        `${API_URL}/dashboard/transactions/export/`,
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
      console.error("Error exporting transactions:", error);
      throw error;
    }
  }

  async getRevenueAnalytics(params?: {
    date_filter?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueAnalytics> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const queryParams: Record<string, any> = {};

      if (params?.date_filter) {
        queryParams.date_filter = params.date_filter;
      }
      if (params?.start_date) {
        queryParams.start_date = params.start_date;
      }
      if (params?.end_date) {
        queryParams.end_date = params.end_date;
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/transactions/revenue_analytics/`,
        method: "GET",
        params: queryParams,
        requireToken: true,
        token: accessToken,
      });

      return response;
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      throw error;
    }
  }

  async createProduct(data: {
    name: string;
    description: string;
    price?: string;
    color?: string;
    size?: "S" | "M" | "L" | "XL" | "XXL";
    category?: number | null;
    subcategory?: number | null;
    tag_ids?: number[];
    stock_level?: number;
    is_active?: boolean;
    images?: File[];
  }): Promise<ApiProductDetail> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Append product fields
      formData.append("name", data.name);
      formData.append("description", data.description);

      if (data.price) {
        formData.append("price", data.price);
      }
      if (data.color) {
        formData.append("color", data.color);
      }
      if (data.size) {
        formData.append("size", data.size);
      }
      if (data.category !== undefined && data.category !== null) {
        formData.append("category", data.category.toString());
      }
      if (data.subcategory !== undefined && data.subcategory !== null) {
        formData.append("subcategory", data.subcategory.toString());
      }
      if (data.tag_ids && data.tag_ids.length > 0) {
        data.tag_ids.forEach((tagId) => {
          formData.append("tag_ids", tagId.toString());
        });
      }
      if (data.stock_level !== undefined) {
        formData.append("stock_level", data.stock_level.toString());
      }
      if (data.is_active !== undefined) {
        formData.append("is_active", data.is_active.toString());
      }

      // Append images array
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image, image.name);
        });
      }

      // Debug: Log FormData contents
      console.log("FormData entries:", Array.from(formData.entries()).map(([key, value]) => [
        key,
        value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value,
      ]));

      // Use axios directly for FormData to ensure proper multipart/form-data handling
      // The Api instance has default Content-Type header which interferes with FormData
      const response = await axios({
        method: "POST",
        url: `${API_URL}/dashboard/products/`,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Explicitly delete Content-Type to let axios set it automatically with boundary
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // API returns { message, product, images_uploaded }
      // Return the product object
      return response.data.product || response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(
    productId: number,
    data: {
      name?: string;
      description?: string;
      price?: string;
      color?: string;
      size?: "S" | "M" | "L" | "XL" | "XXL";
      category?: number | null;
      subcategory?: number | null;
      tag_ids?: number[];
      stock_level?: number;
      is_active?: boolean;
    }
  ): Promise<ApiProductDetail> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await makeRequest({
        url: `${API_URL}/dashboard/products/${productId}/`,
        method: "PATCH",
        requireToken: true,
        token: accessToken,
        data,
      });

      return response;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async addProductImages(
    productId: number,
    images: File[]
  ): Promise<any> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Append images array
      images.forEach((image) => {
        formData.append("images", image, image.name);
      });

      // Use axios directly for FormData to ensure proper multipart/form-data handling
      const response = await axios({
        method: "POST",
        url: `${API_URL}/dashboard/products/${productId}/add_images/`,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - axios will automatically set it with boundary for FormData
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error) {
      console.error("Error adding product images:", error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      await makeRequest({
        url: `${API_URL}/dashboard/products/${productId}/`,
        method: "DELETE",
        requireToken: true,
        token: accessToken,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        throw new Error("No access token available");
      }

      await makeRequest({
        url: `${API_URL}/dashboard/products/${productId}/remove_image/`,
        method: "DELETE",
        requireToken: true,
        token: accessToken,
        data: { image_id: imageId },
      });
    } catch (error) {
      console.error("Error deleting product image:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
