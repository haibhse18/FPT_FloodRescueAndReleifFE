/**
 * Auth Repository Interface - Domain layer
 * Định nghĩa contract cho auth operations, không phụ thuộc implementation
 */

import { 
    User, 
    AuthTokens, 
    LoginCredentials, 
    RegisterData 
} from './user.entity';

export interface IAuthRepository {
    /**
     * Đăng nhập user
     */
    login(credentials: LoginCredentials): Promise<AuthTokens>;

    /**
     * Đăng ký user mới
     */
    register(data: RegisterData): Promise<AuthTokens>;

    /**
     * Đăng xuất
     */
    logout(): Promise<void>;

    /**
     * Lấy thông tin user hiện tại
     */
    getCurrentUser(): Promise<User>;

    /**
     * Đổi mật khẩu
     */
    changePassword(oldPassword: string, newPassword: string): Promise<void>;

    /**
     * Refresh token
     */
    refreshToken(refreshToken: string): Promise<AuthTokens>;
}
