/**
 * Auth API Adapter - Infrastructure layer
 * Direct API calls cho authentication
 */

import {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  User,
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
} from "../domain/user.entity";
import axiosInstance from "@/lib/axios";

/**
 * Auth API methods
 */
export const authApi = {
  /**
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  /**
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  /**
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  /**
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>("/auth/me");
    return response.data;
  },

  /**
   * POST /auth/change-password
   */
  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await axiosInstance.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },

  /**
   * POST /auth/refresh
   * Sử dụng '/auth/refresh' để khớp với logic trong interceptor của axios.ts
   * Cookie refreshToken sẽ được tự động gửi kèm
   */
  refreshToken: async (): Promise<RefreshResponse> => {
    const response = await axiosInstance.post<RefreshResponse>("/auth/refresh");
    return response.data;
  },
};
