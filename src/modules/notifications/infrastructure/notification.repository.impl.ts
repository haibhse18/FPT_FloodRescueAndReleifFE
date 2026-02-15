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
        return (response as any).data || [];
    }

    async markAsRead(notificationId: string): Promise<void> {
        await notificationsApi.markNotificationAsRead(notificationId);
    }

    async markAllAsRead(): Promise<void> {
        await notificationsApi.markAllNotificationsAsRead();
    }

    async getUnreadCount(): Promise<number> {
        const response = await notificationsApi.getUnreadCount();
        return (response as any).count || 0;
    }
}

// Singleton instance for easy access
export const notificationRepository = new NotificationRepositoryImpl();
