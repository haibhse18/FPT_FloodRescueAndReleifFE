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
     * Get summary report / dashboard statistics
     * GET /reports/summary
     */
    getDashboardStats: async (): Promise<ApiResponse> => {
        return apiClient.get('/reports/summary', {
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
     * GET /users
     */
    getUsers: async (role?: string): Promise<ApiResponse> => {
        const params = role ? `?role=${role}` : '';
        return apiClient.get(`/users${params}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update user role (only role field is supported by the API)
     * PATCH /users/{userId}/role
     */
    updateUser: async (userId: string, data: { role: string }): Promise<ApiResponse> => {
        return apiClient.patch(`/users/${userId}/role`, data, {
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
     * GET /users
     */
    getAllUsers: async (): Promise<ApiResponse> => {
        return apiClient.get('/users', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Get system categories/configuration
     * GET /system/categories
     */
    getSystemConfig: async (): Promise<ApiResponse> => {
        return apiClient.get('/system/categories', {
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
        displayName?: string;
        phoneNumber?: string;
        address?: string;
    }): Promise<ApiResponse> => {
        return apiClient.put('/citizen/profile', data, {
            headers: authSession.getAuthHeaders(),
        });
    },
};
