/**
 * Notification Repository Interface - Domain layer
 *
 * Contract cho notification operations theo Noti-guide.md.
 * Bao gồm pagination, delete single/all.
 */

import { Notification, NotificationListResponse } from "./notification.entity";

export interface INotificationRepository {
  /**
   * Lấy danh sách thông báo của user hiện tại (có pagination)
   */
  getNotifications(
    page?: number,
    limit?: number,
  ): Promise<NotificationListResponse>;

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Xoá 1 notification
   */
  deleteNotification(notificationId: string): Promise<void>;

  /**
   * Xoá tất cả notification của user
   */
  deleteAll(userId: string): Promise<void>;
}
