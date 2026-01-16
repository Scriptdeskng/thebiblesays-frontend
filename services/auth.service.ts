/* eslint-disable @typescript-eslint/no-empty-object-type */
import makeRequest, { API_URL } from "@/lib/api";
import { User } from "@/types/user.types";
import axios from "axios";

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile: {
      date_of_birth: string | null;
      profile_picture: string | null;
    };
  };
}

interface RegisterResponse extends LoginResponse {}

interface DashboardLoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
}

class AuthService {
  private transformUser(apiUser: LoginResponse["user"]): User {
    return {
      id: apiUser.id,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      email: apiUser.email,
      phoneNumber: apiUser.phone,
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; tokens: { access: string; refresh: string } }> {
    try {
      const response: LoginResponse = await makeRequest({
        url: "auth/login/",
        method: "POST",
        data: {
          username: email,
          email,
          password,
        },
      });

      return {
        user: this.transformUser(response.user),
        tokens: {
          access: response.access,
          refresh: response.refresh,
        },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.response?.data) {
        console.error("API Error Response:", error.response.data);
      }
      throw error;
    }
  }

  async register(data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone: string;
  }): Promise<{ user: User; tokens: { access: string; refresh: string } }> {
    try {
      const requestData = {
        username: data.username,
        email: data.email,
        password: data.password1,
        password1: data.password1,
        password2: data.password2,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      };

      const response: RegisterResponse = await makeRequest({
        url: "auth/registration/",
        method: "POST",
        data: requestData,
      });

      return {
        user: this.transformUser(response.user),
        tokens: {
          access: response.access,
          refresh: response.refresh,
        },
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error?.response?.data) {
        console.error("API Error Response:", error.response.data);
        Object.keys(error.response.data).forEach((key) => {
          console.error(`${key}:`, error.response.data[key]);
        });
      }
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await makeRequest({
        url: "auth/logout/",
        method: "POST",
        requireToken: true,
        token,
      });
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  async getProfile(token: string): Promise<User> {
    try {
      const response = await makeRequest({
        url: "auth/user/",
        method: "GET",
        requireToken: true,
        token,
      });

      return this.transformUser(response);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  async updateProfile(token: string, data: Partial<User>): Promise<User> {
    try {
      const response = await makeRequest({
        url: "auth/user/",
        method: "PATCH",
        requireToken: true,
        token,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phoneNumber,
        },
      });

      return this.transformUser(response);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async changePassword(
    token: string,
    newPassword1: string,
    newPassword2: string
  ): Promise<void> {
    try {
      await makeRequest({
        url: "auth/password/change/",
        method: "POST",
        requireToken: true,
        token,
        data: {
          new_password1: newPassword1,
          new_password2: newPassword2,
        },
      });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await makeRequest({
        url: "auth/password/reset/",
        method: "POST",
        data: { email },
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword1: string,
    newPassword2: string
  ): Promise<void> {
    try {
      await makeRequest({
        url: "auth/password/reset/confirm/",
        method: "POST",
        data: {
          uid,
          token,
          new_password1: newPassword1,
          new_password2: newPassword2,
        },
      });
    } catch (error) {
      console.error("Error confirming password reset:", error);
      throw error;
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ access: string; refresh: string }> {
    try {
      const response = await makeRequest({
        url: "auth/token/refresh/",
        method: "POST",
        data: { refresh: refreshToken },
      });

      return {
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  async dashboardLogin(
    username: string,
    password: string
  ): Promise<{
    user: DashboardLoginResponse["user"];
    tokens: { access: string; refresh: string };
  }> {
    try {
      const response: DashboardLoginResponse = await makeRequest({
        url: `${API_URL}/dashboard/auth/login/`,
        method: "POST",
        data: {
          username,
          password,
        },
      });

      return {
        user: response.user,
        tokens: {
          access: response.access,
          refresh: response.refresh,
        },
      };
    } catch (error: any) {
      console.error("Dashboard login error:", error);
      if (error?.response?.data) {
        console.error("API Error Response:", error.response.data);
      }
      throw error;
    }
  }

  async dashboardPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/dashboard/auth/password-reset/`,
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error("Dashboard password reset error:", error);
      if (error?.response?.data) {
        console.error("API Error Response:", error.response.data);
      }
      throw error;
    }
  }

  async adminRefreshToken(
    refreshToken: string
  ): Promise<{ access: string; refresh: string }> {
    try {
      const response = await makeRequest({
        url: `${API_URL}/dashboard/auth/token/refresh/`,
        method: "POST",
        data: { refresh: refreshToken },
      });

      return {
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
