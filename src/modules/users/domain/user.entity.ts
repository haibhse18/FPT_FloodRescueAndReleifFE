/**
 * Profile Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Profile, không phụ thuộc framework
 */

export interface UserProfile {
    id: string;
    userName: string;
    phone: string;
    displayName: string;
    email: string;
    address?: string;
    avatarUrl?: string;
}

export interface UpdateProfileData {
    userName?: string;
    phone?: string;
    address?: string;
    displayName?: string;
}

export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface DashboardStats {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    activeTeams: number;
}

export interface Report {
    id: string;
    type: ReportType;
    title: string;
    data: unknown;
    createdAt: Date;
}

export interface UserListItem {
    id: string;
    userName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: Date;
}

export interface SystemConfig {
    [key: string]: unknown;
}

export interface SystemLog {
    id: string;
    action: string;
    userId: string;
    timestamp: Date;
    details: string;
}
