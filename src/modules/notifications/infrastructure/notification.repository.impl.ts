/**
 * Notification Repository Implementation - Infrastructure layer
 * Implement INotificationRepository interface using notificationsApi
 */

import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { notificationsApi } from './notifications.api';

/** Unwrap paginated response: { success, data: [...], meta } or plain array */
function extractList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
}

export class NotificationRepositoryImpl implements INotificationRepository {
    async getNotifications(): Promise<Notification[]> {
        // GET /notifications/me → { success, message, data: Notification[], meta: Pagination }
        const response = await notificationsApi.getNotifications();
        return extractList(response) as unknown as Notification[];
    }

    async markAsRead(notificationId: string): Promise<void> {
        await notificationsApi.markNotificationAsRead(notificationId);
    }

    async markAllAsRead(): Promise<void> {
        // No bulk mark-all-read endpoint — fetch unread list then mark each individually
        try {
            const response = await notificationsApi.getNotifications({ isRead: false });
            const unread = extractList(response);
            await Promise.allSettled(
                unread
                    .map((n: any) => n._id || n.id)
                    .filter(Boolean)
                    .map((id: string) => notificationsApi.markNotificationAsRead(id)),
            );
        } catch {
            // silently fail — UI has already done optimistic update
        }
    }

    async getUnreadCount(): Promise<number> {
        // Filter unread only to minimise payload
        try {
            const response = await notificationsApi.getNotifications({ isRead: false, limit: 100 });
            return extractList(response).length;
        } catch {
            return 0;
        }
    }
}

// Singleton instance for easy access
export const notificationRepository = new NotificationRepositoryImpl();
