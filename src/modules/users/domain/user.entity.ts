/**
 * Profile Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Profile, không phụ thuộc framework
 */

export interface UserProfile {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    address?: string;
    avatar?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
}

export interface UpdateProfileData {
    fullName?: string;
    phone?: string;
    address?: string;
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
    fullName: string;
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
