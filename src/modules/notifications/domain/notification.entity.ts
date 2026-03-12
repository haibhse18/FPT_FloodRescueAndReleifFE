/**
 * Notification Entity - Domain layer
 *
 * Schema theo Noti-guide.md + ERD.
 * Bao gồm WITHDRAWN type và requestId/missionId fields.
 */

export type NotificationType =
  | "SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "WITHDRAWN";

export type NotificationRole =
  | "CITIZEN"
  | "COORDINATOR"
  | "TEAM_LEADER"
  | "ADMIN"
  | "MANAGER";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  role: NotificationRole;
  message: string;
  requestId: string;
  missionId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  /** Chỉ có khi nhận qua WebSocket */
  timestamp?: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
