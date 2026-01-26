/**
 * Auth API Adapter - Infrastructure layer
 * Direct API calls cho authentication
 */

import { 
    LoginCredentials, 
    RegisterData, 
    AuthTokens, 
    User 
} from '../domain/user.entity';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Get token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Auth API methods
 */
export const authApi = {
    /**
     * POST /auth/login
     */
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Đăng nhập thất bại');
        }

        return response.json();
    },

    /**
     * POST /auth/register
     */
    register: async (data: RegisterData): Promise<AuthTokens> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Đăng ký thất bại');
        }

        return response.json();
    },

    /**
     * POST /auth/logout
     */
    logout: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
        });

        // Clear token regardless of response
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
        }

        if (!response.ok) {
            console.warn('Logout API failed, but token cleared locally');
        }
    },

    /**
     * GET /auth/me
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin người dùng');
        }

        return response.json();
    },

    /**
     * POST /auth/change-password
     */
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Đổi mật khẩu thất bại');
        }
    },

    /**
     * POST /auth/refresh-token
     */
    refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Không thể refresh token');
        }

        return response.json();
    },
};
