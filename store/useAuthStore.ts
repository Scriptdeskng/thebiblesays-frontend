import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user.types";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { useCartStore } from "./useCartStore";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  dashboardLogin: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  isLoading?: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          const { user, tokens } = await authService.login(email, password);
          set({
            user,
            isAuthenticated: true,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          });

          toast.success("Logged in successfully!");
        } catch (error: any) {
          toast.error(error?.response?.data?.detail || "Login failed");
          throw error;
        }
      },

      dashboardLogin: async (username: string, password: string) => {
        try {
          const { user: adminUser, tokens } = await authService.dashboardLogin(
            username,
            password
          );

          if (!adminUser.is_superuser) {
            toast.error("Access denied. Admin privileges required.");
            throw new Error("Access denied. Admin privileges required.");
          }

          const user: User = {
            id: adminUser.id,
            firstName: adminUser.first_name,
            lastName: adminUser.last_name,
            email: adminUser.email,
            phoneNumber: "",
          };

          set({
            user,
            isAuthenticated: true,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          });

          localStorage.setItem("authToken", tokens.access);
          localStorage.setItem("refreshToken", tokens.refresh);
        } catch (error: any) {
          if (!error?.message?.includes("Access denied")) {
            toast.error(
              error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Login failed"
            );
          }
          throw error;
        }
      },

      register: async (data) => {
        try {
          const { user, tokens } = await authService.register(data);
          set({
            user,
            isAuthenticated: true,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          });

          toast.success("Account created successfully!");
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.email?.[0] ||
            error?.response?.data?.password1?.[0] ||
            "Registration failed";
          toast.error(errorMsg);
          throw error;
        }
      },

      logout: async () => {
        const { accessToken } = get();
        try {
          if (accessToken) {
            await authService.logout(accessToken);
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
          });

          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");

          const cartStore = useCartStore.getState();
          cartStore.clearCart();
          toast.success("Logged out successfully");
        }
      },

      updateUser: async (updates: Partial<User>) => {
        const { accessToken, user } = get();
        if (!accessToken || !user) return;

        try {
          const updatedUser = await authService.updateProfile(
            accessToken,
            updates
          );
          set({ user: updatedUser });
          toast.success("Profile updated successfully!");
        } catch (error: any) {
          toast.error("Failed to update profile");
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const tokens = await authService.refreshToken(refreshToken);
          set({
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          });
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
