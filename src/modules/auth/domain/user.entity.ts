/**
 * User Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu User, không phụ thuộc framework
 */

export interface User {
    _id?: string; // MongoDB ID
    id?: string;  // Fallback
    userName: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    avatar?: string;
    address?: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Các role hợp lệ theo API_list.md
export type UserRole = 
    | 'Citizen' 
    | 'Rescue Team' 
    | 'Rescue Coordinator' 
    | 'Manager' 
    | 'Admin';

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

// Response từ login API
export interface LoginResponse {
    accessToken: string;
    user: User;
}

// Response từ register API
export interface RegisterResponse {
    message: string;
    userId: string;
}

// Response từ refresh API
export interface RefreshResponse {
    accessToken: string;
    user: User;
}

// Response từ getCurrentUser API - API trả về User object trực tiếp
export type GetCurrentUserResponse = User;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    userName: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    role?: UserRole;
}

export interface AuthSession {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}
