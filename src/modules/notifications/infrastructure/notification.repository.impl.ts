/**
 * Notification Repository Implementation - Infrastructure layer
 *
 * Implement INotificationRepository using notificationsApi.
 */

import { INotificationRepository } from "../domain/notification.repository";
import { NotificationListResponse } from "../domain/notification.entity";
import { notificationsApi } from "./notifications.api";

export class NotificationRepositoryImpl implements INotificationRepository {
  async getNotifications(
    page = 1,
    limit = 10,
  ): Promise<NotificationListResponse> {
    const response = await notificationsApi.getNotifications(page, limit);
    return {
      data: response.data || [],
      meta: response.meta || { page: 1, limit: 10, total: 0, pages: 1 },
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await notificationsApi.markAsRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await notificationsApi.deleteNotification(notificationId);
  }

  async deleteAll(userId: string): Promise<void> {
    await notificationsApi.deleteAll(userId);
  }
}

// Singleton instance
export const notificationRepository = new NotificationRepositoryImpl();
