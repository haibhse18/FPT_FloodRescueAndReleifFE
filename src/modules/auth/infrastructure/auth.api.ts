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
import { ApiResponse } from "@/types";
import axiosInstance from "@/lib/axios";

/**
 * Auth API methods
 */
export const authApi = {
  /**
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials,
    );
    if (!response.data.data) {
      throw new Error("No data received from login");
    }
    return response.data.data;
  },

  /**
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data,
    );
    if (!response.data.data) {
      throw new Error("No data received from register");
    }
    return response.data.data;
  },

  /**
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post<ApiResponse<void>>("/auth/logout");
  },

  /**
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>("/auth/me");
    if (!response.data.data) {
      throw new Error("No data received from getCurrentUser");
    }
    return response.data.data;
  },

  /**
   * POST /auth/change-password
   */
  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<void>>("/auth/change-password", {
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
    const response =
      await axiosInstance.post<ApiResponse<RefreshResponse>>("/auth/refresh");
    if (!response.data.data) {
      throw new Error("No data received from refresh");
    }
    return response.data.data;
  },
};
