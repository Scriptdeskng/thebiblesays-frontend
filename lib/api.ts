import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { ApiRequestParams } from "@/types/api.types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Api = axios.create({
  baseURL: `${API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 120000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

Api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("auth/token/refresh/")) {
        authStore.logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return Api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStore.refreshToken;
        const userRole = authStore.user?.role;

        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          `${API_URL}/${
            userRole === "admin" ? "dashboard" : "api"
          }/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        useAuthStore.setState({ accessToken: access });

        processQueue(null, access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return Api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const makeRequest = async ({
  method = "GET",
  url,
  data = null,
  params = {},
  requireToken,
  token,
  content_type = "application/json",
}: ApiRequestParams): Promise<any> => {
  const headers: any = {
    "Content-Type": content_type,
  };

  if (token) {
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
