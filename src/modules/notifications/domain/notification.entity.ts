/**
 * Notification Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Notification, không phụ thuộc framework
 */

export type NotificationType = 'success' | 'warning' | 'info' | 'emergency';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionLabel?: string;
    actionLink?: string;
}
