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
import axios from "axios";
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
    const response = await axiosInstance.get<ApiResponse<User>>("/auth/me", {
      timeout: 15000,
    });
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
   * Sử dụng bare axios (KHÔNG dùng axiosInstance) để tránh interceptor tự thêm
   * Authorization header với token hết hạn và gây vòng lặp 401.
   * Cookie refreshToken sẽ được tự động gửi kèm (withCredentials: true).
   */
  refreshToken: async (): Promise<RefreshResponse> => {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await axios.post<ApiResponse<RefreshResponse>>(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    if (!response.data.data) {
      throw new Error("No data received from refresh");
    }
    return response.data.data;
  },
};
