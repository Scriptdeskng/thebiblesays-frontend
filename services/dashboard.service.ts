import makeRequest, { API_URL } from "@/lib/api";
import { DashboardOverview } from "@/types/admin.types";
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
}

export const dashboardService = new DashboardService();
