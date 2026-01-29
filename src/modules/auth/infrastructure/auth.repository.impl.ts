/**
 * Auth Repository Implementation - Infrastructure layer
 * Implement IAuthRepository interface using authApi
 * 
 * Theo auth-flow.md: Access token lưu trong memory, không dùng localStorage
 */

import { IAuthRepository } from '../domain/auth.repository';
import { 
    LoginCredentials, 
    RegisterData,
    LoginResponse,
    RegisterResponse,
    RefreshResponse,
    GetCurrentUserResponse
} from '../domain/user.entity';
import { authApi } from './auth.api';
import { tokenManager } from '@/lib/axios';

export class AuthRepositoryImpl implements IAuthRepository {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await authApi.login(credentials);
        
        // Lưu accessToken vào memory (không phải localStorage)
        // Theo auth-flow.md: "Lưu accessToken vào memory/state"
        if (response.accessToken) {
            tokenManager.setToken(response.accessToken);
        }

        return response;
    }

    async register(data: RegisterData): Promise<RegisterResponse> {
        // Gọi API register - không tự động login sau khi đăng ký
        const response = await authApi.register(data);
        return response;
    }

    async logout(): Promise<void> {
        try {
            await authApi.logout();
        } finally {
            // Xóa token khỏi memory
            // Theo auth-flow.md: "Xóa accessToken khỏi memory"
            tokenManager.clearToken();
        }
    }

    async getCurrentUser(): Promise<GetCurrentUserResponse> {
        return authApi.getCurrentUser();
    }

    async refreshToken(): Promise<RefreshResponse> {
        const response = await authApi.refreshToken();
        
        // Cập nhật accessToken mới vào memory
        if (response.accessToken) {
            tokenManager.setToken(response.accessToken);
        }

        return response;
    }
}

// Singleton instance for easy access
export const authRepository = new AuthRepositoryImpl();
