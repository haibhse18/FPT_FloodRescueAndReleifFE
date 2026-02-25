/**
 * Notifications API - Infrastructure Layer
 * Handles user notifications
 *
 * Auth is injected automatically by the axios request interceptor (Bearer token).
 * No need to pass headers manually.
 */

import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';

export const notificationsApi = {
    /**
     * Get user notifications
     * GET /notifications
     */
    getNotifications: async (): Promise<ApiResponse> => {
        return apiClient.get('/notifications');
    },

    /**
     * Mark notification as read
     * PATCH /notifications/{id}/read
     */
    markNotificationAsRead: async (notificationId: string): Promise<ApiResponse> => {
        return apiClient.patch(`/notifications/${notificationId}/read`, undefined);
    },

    // NOTE: No bulk mark-all-read endpoint in swagger.
    // No unread-count endpoint in swagger.
    // Both are derived client-side from the getNotifications list.
};
