/**
 * Auth Repository Implementation - Infrastructure layer
 * Implement IAuthRepository interface using authApi
 */

import { IAuthRepository } from '../domain/auth.repository';
import { 
    User, 
    AuthTokens, 
    LoginCredentials, 
    RegisterData 
} from '../domain/user.entity';
import { authApi } from './auth.api';

export class AuthRepositoryImpl implements IAuthRepository {
    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const tokens = await authApi.login(credentials);
        
        // Store token after successful login
        if (typeof window !== 'undefined' && tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
        }

        return tokens;
    }

    async register(data: RegisterData): Promise<AuthTokens> {
        const tokens = await authApi.register(data);

        // Optionally store token after registration
        if (typeof window !== 'undefined' && tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
        }

        return tokens;
    }

    async logout(): Promise<void> {
        await authApi.logout();
        
        // Clear all auth data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    async getCurrentUser(): Promise<User> {
        return authApi.getCurrentUser();
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await authApi.changePassword(oldPassword, newPassword);
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const tokens = await authApi.refreshToken(refreshToken);
        
        // Update stored token
        if (typeof window !== 'undefined' && tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
        }

        return tokens;
    }
}

// Singleton instance for easy access
export const authRepository = new AuthRepositoryImpl();
