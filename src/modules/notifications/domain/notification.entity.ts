/**
 * Notification Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Notification, không phụ thuộc framework
 */

/** UI display type — mapped from BackendNotificationType */
export type NotificationType = 'success' | 'warning' | 'info' | 'emergency';

/** Backend API notification type enum (Swagger: Notification.type) */
export type BackendNotificationType =
    | 'SUBMITTED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'WITHDRAWN';

/** Query params for GET /notifications/me */
export interface NotificationQueryParams {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: BackendNotificationType;
    sortOrder?: 'asc' | 'desc';
}

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
