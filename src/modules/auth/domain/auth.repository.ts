/**
 * Auth Repository Interface - Domain layer
 * Định nghĩa contract cho auth operations, không phụ thuộc implementation
 */

import { 
    User, 
    LoginCredentials, 
    RegisterData,
    LoginResponse,
    RegisterResponse,
    RefreshResponse,
    GetCurrentUserResponse
} from './user.entity';

export interface IAuthRepository {
    /**
     * Đăng nhập user
     * POST /api/auth/login
     */
    login(credentials: LoginCredentials): Promise<LoginResponse>;

    /**
     * Đăng ký user mới
     * POST /api/auth/register
     */
    register(data: RegisterData): Promise<RegisterResponse>;

    /**
     * Đăng xuất
     * POST /api/auth/logout
     */
    logout(): Promise<void>;

    /**
     * Lấy thông tin user hiện tại
     * GET /api/auth/me
     */
    getCurrentUser(): Promise<GetCurrentUserResponse>;

    /**
     * Refresh token
     * POST /api/auth/refresh
     */
    refreshToken(): Promise<RefreshResponse>;
}
