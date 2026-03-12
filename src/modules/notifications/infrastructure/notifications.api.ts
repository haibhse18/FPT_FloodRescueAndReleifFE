/**
 * Notifications API - Infrastructure Layer
 * Handles user notifications
 *
 * Auth is injected automatically by the axios request interceptor (Bearer token).
 * No need to pass headers manually.
 */

import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type { NotificationQueryParams } from '../domain/notification.entity';

export const notificationsApi = {
    /**
     * Get current user's notifications
     * GET /notifications/me
     */
    getNotifications: async (params?: NotificationQueryParams): Promise<ApiResponse> => {
        return apiClient.get('/notifications/me', { params });
    },

    /**
     * Mark notification as read
     * PATCH /notifications/read/{notificationId}
     */
    markNotificationAsRead: async (notificationId: string): Promise<ApiResponse> => {
        return apiClient.patch(`/notifications/read/${notificationId}`);
    },

    /**
     * Delete a notification
     * DELETE /notifications/{notificationId}
     */
    deleteNotification: async (notificationId: string): Promise<ApiResponse> => {
        return apiClient.delete(`/notifications/${notificationId}`);
    },

    // NOTE: No bulk mark-all-read endpoint in swagger.
    // Derived client-side: fetch list then mark each unread one individually.
};
