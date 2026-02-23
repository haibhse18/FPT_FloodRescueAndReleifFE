/**
 * Notifications API - Infrastructure Layer
 * Handles user notifications
 */

import { apiClient } from '@/services/apiClient';
import { authSession } from '@/services/authSession';
import type { ApiResponse } from '@/shared/types/api';

export const notificationsApi = {
    /**
     * Get user notifications
     * GET /notifications
     */
    getNotifications: async (): Promise<ApiResponse> => {
        return apiClient.get('/notifications', {
            headers: authSession.getAuthHeaders() as Record<string, string>,
        });
    },

    /**
     * Mark notification as read
     * PATCH /notifications/{id}/read
     */
    markNotificationAsRead: async (notificationId: string): Promise<ApiResponse> => {
        return apiClient.patch(`/notifications/${notificationId}/read`, undefined, {
            headers: authSession.getAuthHeaders() as Record<string, string>,
        });
    },

    /**
     * Mark all notifications as read
     * PATCH /notifications/mark-all-read
     */
    markAllNotificationsAsRead: async (): Promise<ApiResponse> => {
        return apiClient.patch('/notifications/mark-all-read', undefined, {
            headers: authSession.getAuthHeaders() as Record<string, string>,
        });
    },

    /**
     * Get unread notifications count
     * GET /notifications/unread-count
     */
    getUnreadCount: async (): Promise<ApiResponse> => {
        return apiClient.get('/notifications/unread-count', {
            headers: authSession.getAuthHeaders() as Record<string, string>,
        });
    },
};
