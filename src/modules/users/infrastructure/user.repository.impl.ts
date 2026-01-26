/**
 * User Repository Implementation - Infrastructure layer
 * Implement user repository interfaces using APIs
 */

import { 
    IUserRepository, 
    IManagerRepository, 
    IAdminRepository 
} from '../domain/user.repository';
import { 
    UpdateProfileData, 
    DashboardStats, 
    Report, 
    ReportType,
    UserListItem,
    SystemConfig,
    SystemLog
} from '../domain/user.entity';
import { usersApi, managerApi, adminApi } from './users.api';

export class UserRepositoryImpl implements IUserRepository {
    async updateProfile(data: UpdateProfileData): Promise<void> {
        await usersApi.updateProfile(data);
    }
}

export class ManagerRepositoryImpl implements IManagerRepository {
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await managerApi.getDashboardStats();
        return (response as any).data;
    }

    async getReports(type: ReportType): Promise<Report[]> {
        const response = await managerApi.getReports(type);
        return (response as any).data || [];
    }

    async getUsers(role?: string): Promise<UserListItem[]> {
        const response = await managerApi.getUsers(role);
        return (response as any).data || [];
    }

    async updateUser(userId: string, data: unknown): Promise<void> {
        await managerApi.updateUser(userId, data);
    }

    async deleteUser(userId: string): Promise<void> {
        await managerApi.deleteUser(userId);
    }
}

export class AdminRepositoryImpl implements IAdminRepository {
    async getAllUsers(): Promise<UserListItem[]> {
        const response = await adminApi.getAllUsers();
        return (response as any).data || [];
    }

    async getSystemConfig(): Promise<SystemConfig> {
        const response = await adminApi.getSystemConfig();
        return (response as any).data;
    }

    async updateSystemConfig(config: SystemConfig): Promise<void> {
        await adminApi.updateSystemConfig(config);
    }

    async getSystemLogs(page: number = 1, limit: number = 50): Promise<SystemLog[]> {
        const response = await adminApi.getSystemLogs(page, limit);
        return (response as any).data || [];
    }

    async backupDatabase(): Promise<void> {
        await adminApi.backupDatabase();
    }
}

// Singleton instances for easy access
export const userRepository = new UserRepositoryImpl();
export const managerRepository = new ManagerRepositoryImpl();
export const adminRepository = new AdminRepositoryImpl();
