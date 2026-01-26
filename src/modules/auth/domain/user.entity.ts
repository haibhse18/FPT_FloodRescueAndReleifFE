/**
 * User Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu User, không phụ thuộc framework
 */

export interface User {
    id: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    role: UserRole;
    avatar?: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserRole = 
    | 'citizen' 
    | 'coordinator' 
    | 'rescue_team' 
    | 'manager' 
    | 'admin';

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface LoginCredentials {
    phoneNumber?: string;
    email?: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: UserRole;
}

export interface AuthSession {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
}
