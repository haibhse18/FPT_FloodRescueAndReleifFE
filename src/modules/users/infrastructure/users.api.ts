/**
 * Users/Manager API - Infrastructure Layer
 * Handles user management, dashboard, and reporting
 */

import { apiClient } from '@/services/apiClient';
import { authSession } from '@/services/authSession';
import type { ApiResponse } from '@/shared/types/api';

export type ReportType = 'daily' | 'weekly' | 'monthly';

export const managerApi = {
    /**
     * Get dashboard statistics
     * GET /manager/dashboard
     */
    getDashboardStats: async (): Promise<ApiResponse> => {
        return apiClient.get('/manager/dashboard', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Get reports by type
     * GET /manager/reports
     */
    getReports: async (type: ReportType): Promise<ApiResponse> => {
        return apiClient.get(`/manager/reports?type=${type}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Get users list
     * GET /manager/users
     */
    getUsers: async (role?: string): Promise<ApiResponse> => {
        const params = role ? `?role=${role}` : '';
        return apiClient.get(`/manager/users${params}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update user
     * PUT /manager/users/{userId}
     */
    updateUser: async (userId: string, data: unknown): Promise<ApiResponse> => {
        return apiClient.put(`/manager/users/${userId}`, data, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Delete user
     * DELETE /manager/users/{userId}
     */
    deleteUser: async (userId: string): Promise<ApiResponse> => {
        return apiClient.delete(`/manager/users/${userId}`, {
            headers: authSession.getAuthHeaders(),
        });
    },
};

export const adminApi = {
    /**
     * Get all users (admin access)
     * GET /admin/users
     */
    getAllUsers: async (): Promise<ApiResponse> => {
        return apiClient.get('/admin/users', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Get system configuration
     * GET /admin/config
     */
    getSystemConfig: async (): Promise<ApiResponse> => {
        return apiClient.get('/admin/config', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update system configuration
     * PUT /admin/config
     */
    updateSystemConfig: async (config: unknown): Promise<ApiResponse> => {
        return apiClient.put('/admin/config', config, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Get system logs
     * GET /admin/logs
     */
    getSystemLogs: async (page: number = 1, limit: number = 50): Promise<ApiResponse> => {
        return apiClient.get(`/admin/logs?page=${page}&limit=${limit}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Backup database
     * POST /admin/backup
     */
    backupDatabase: async (): Promise<ApiResponse> => {
        return apiClient.post('/admin/backup', undefined, {
            headers: authSession.getAuthHeaders(),
        });
    },
};

export const usersApi = {
    /**
     * Update user profile
     * PUT /citizen/profile
     */
    updateProfile: async (data: {
        fullName?: string;
        phone?: string;
        address?: string;
    }): Promise<ApiResponse> => {
        return apiClient.put('/citizen/profile', data, {
            headers: authSession.getAuthHeaders(),
        });
    },
};
