/**
 * Auth API Adapter - Infrastructure layer
 * Direct API calls cho authentication sử dụng axios
 */

import axiosInstance from '@/lib/axios';
import { 
    LoginCredentials, 
    RegisterData, 
    LoginResponse,
    RegisterResponse,
    RefreshResponse,
    GetCurrentUserResponse
} from '../domain/user.entity';

/**
 * Auth API methods theo API_list.md
 */
export const authApi = {
    /**
     * POST /api/auth/login
     * Đăng nhập hệ thống
     * Request: { email, password }
     * Response: { accessToken, user }
     */
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản
     * Request: { userName, displayName, email, phoneNumber?, password, role? }
     * Response: { message, userId }
     * Note: role mặc định là "Citizen"
     */
    register: async (data: RegisterData): Promise<RegisterResponse> => {
        const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * POST /api/auth/logout
     * Đăng xuất khỏi hệ thống
     * Request: Refresh token từ cookie (tự động gửi)
     * Response: 204 No Content
     * Note: Xóa refresh token khỏi database và cookie
     */
    logout: async (): Promise<void> => {
        await axiosInstance.post('/auth/logout');
    },

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại
     * Response: { user, role }
     * Auth: Required
     */
    getCurrentUser: async (): Promise<GetCurrentUserResponse> => {
        const response = await axiosInstance.get<GetCurrentUserResponse>('/auth/me');
        return response.data;
    },

    /**
     * POST /api/auth/refresh
     * Làm mới access token
     * Request: Refresh token từ cookie (tự động gửi)
     * Response: { accessToken, user }
     */
    refreshToken: async (): Promise<RefreshResponse> => {
        const response = await axiosInstance.post<RefreshResponse>('/auth/refresh');
        return response.data;
    },
};
