/**
 * User Repository Interface - Domain layer
 * Định nghĩa contract cho user operations, không phụ thuộc implementation
 */

import { 
    UserProfile, 
    UpdateProfileData, 
    DashboardStats, 
    Report, 
    ReportType,
    UserListItem,
    SystemConfig,
    SystemLog
} from './user.entity';

export interface IUserRepository {
    /**
     * Cập nhật profile người dùng
     */
    updateProfile(data: UpdateProfileData): Promise<void>;
}

export interface IManagerRepository {
    /**
     * Lấy thống kê dashboard
     */
    getDashboardStats(): Promise<DashboardStats>;

    /**
     * Lấy báo cáo theo loại
     */
    getReports(type: ReportType): Promise<Report[]>;

    /**
     * Lấy danh sách users
     */
    getUsers(role?: string): Promise<UserListItem[]>;

    /**
     * Cập nhật user
     */
    updateUser(userId: string, data: unknown): Promise<void>;

    /**
     * Xóa user
     */
    deleteUser(userId: string): Promise<void>;
}

export interface IAdminRepository {
    /**
     * Lấy tất cả users (admin)
     */
    getAllUsers(): Promise<UserListItem[]>;

    /**
     * Lấy cấu hình hệ thống
     */
    getSystemConfig(): Promise<SystemConfig>;

    /**
     * Cập nhật cấu hình hệ thống
     */
    updateSystemConfig(config: SystemConfig): Promise<void>;

    /**
     * Lấy logs hệ thống
     */
    getSystemLogs(page?: number, limit?: number): Promise<SystemLog[]>;

    /**
     * Backup database
     */
    backupDatabase(): Promise<void>;
}
