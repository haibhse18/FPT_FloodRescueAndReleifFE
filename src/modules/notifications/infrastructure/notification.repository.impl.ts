/**
 * Notification Repository Implementation - Infrastructure layer
 * Implement INotificationRepository interface using notificationsApi
 */

import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { notificationsApi } from './notifications.api';

export class NotificationRepositoryImpl implements INotificationRepository {
    async getNotifications(): Promise<Notification[]> {
        const response = await notificationsApi.getNotifications();
        // apiClient already unwraps axios response.data, so backend may return
        // Notification[] directly OR { data: Notification[] } wrapped
        if (Array.isArray(response)) return response as unknown as Notification[];
        return (response as any).data || [];
    }

    async markAsRead(notificationId: string): Promise<void> {
        await notificationsApi.markNotificationAsRead(notificationId);
    }

    async markAllAsRead(): Promise<void> {
        // No bulk endpoint in API — fall back to fetching list and marking each one
        try {
            const response = await notificationsApi.getNotifications();
            const list: any[] = Array.isArray(response)
                ? (response as any[])
                : (response as any).data || [];
            const unread = list.filter((n: any) => !(n.isRead ?? n.is_read));
            await Promise.allSettled(
                unread.map((n: any) =>
                    notificationsApi.markNotificationAsRead(n._id || n.id || n.notificationId),
                ),
            );
        } catch {
            // silently fail — UI has already done optimistic update
        }
    }

    async getUnreadCount(): Promise<number> {
        // No dedicated endpoint — derive from notification list
        try {
            const response = await notificationsApi.getNotifications();
            const list: any[] = Array.isArray(response)
                ? (response as any[])
                : (response as any).data || [];
            return list.filter((n: any) => !(n.isRead ?? n.is_read)).length;
        } catch {
            return 0;
        }
    }
}

// Singleton instance for easy access
export const notificationRepository = new NotificationRepositoryImpl();
