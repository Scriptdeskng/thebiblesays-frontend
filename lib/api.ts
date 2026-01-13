import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export interface ApiRequestParams {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  params?: Record<string, any>;
  requireToken?: boolean;
  content_type?: string;
  token?: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

Api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error?.response?.status === 401 &&
      error?.config?.headers?.Authorization
    ) {
      toast.error("Session expired. Please login again.");
      const authStore = useAuthStore.getState();
      authStore.logout();

      const currentPath = window.location.pathname;
      const redirectPath =
        currentPath && currentPath !== "/" ? currentPath : "/shop";

      window.location.href = `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`;
    }
    return Promise.reject(error);
  }
);

const makeRequest = async ({
  method = "GET",
  url,
  data = null,
  params = {},
  requireToken = false,
  content_type = "application/json",
  token,
}: ApiRequestParams): Promise<any> => {
  const headers: any = {
    "Content-Type": content_type,
  };

  if (requireToken && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await Api({
    method,
    url,
    data,
    params,
    headers,
  });

  return response.data;
};

export default makeRequest;
