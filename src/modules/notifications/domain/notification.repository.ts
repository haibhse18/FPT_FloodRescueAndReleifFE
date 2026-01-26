/**
 * Notification Repository Interface - Domain layer
 * Định nghĩa contract cho notification operations, không phụ thuộc implementation
 */

import { Notification } from './notification.entity';

export interface INotificationRepository {
    /**
     * Lấy danh sách thông báo
     */
    getNotifications(): Promise<Notification[]>;

    /**
     * Đánh dấu thông báo đã đọc
     */
    markAsRead(notificationId: string): Promise<void>;

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    markAllAsRead(): Promise<void>;
}
