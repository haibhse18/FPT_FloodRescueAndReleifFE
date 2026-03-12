/**
 * Notifications API - Infrastructure Layer
 *
 * Endpoints theo Noti-guide.md:
 *   GET    /notifications/:userId?page=&limit=
 *   PATCH  /notifications/read/:notificationId
 *   DELETE /notifications/:notificationId
 *   DELETE /notifications/user/:userId
 *
 * Không cần manual auth headers — axios interceptor tự thêm Authorization.
 */

import { apiClient } from "@/services/apiClient";
import type {
  Notification,
  NotificationListResponse,
} from "../domain/notification.entity";

interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationsApi = {
  /**
   * Lấy danh sách notification của user hiện tại
   * GET /notifications/me?page=&limit=
   */
  getNotifications: async (
    page = 1,
    limit = 10,
  ): Promise<ApiSuccessResponse<Notification[]>> => {
    return apiClient.get<ApiSuccessResponse<Notification[]>>(
      `/notifications/me?page=${page}&limit=${limit}`,
    );
  },

  /**
   * Đánh dấu đã đọc
   * PATCH /notifications/read/:notificationId
   */
  markAsRead: async (
    notificationId: string,
  ): Promise<ApiSuccessResponse<Notification>> => {
    return apiClient.patch<ApiSuccessResponse<Notification>>(
      `/notifications/read/${notificationId}`,
    );
  },

  /**
   * Xoá 1 notification
   * DELETE /notifications/:notificationId
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<ApiSuccessResponse<null>> => {
    return apiClient.delete<ApiSuccessResponse<null>>(
      `/notifications/${notificationId}`,
    );
  },

  /**
   * Xoá tất cả notification của user
   * DELETE /notifications/user/:userId
   */
  deleteAll: async (userId: string): Promise<ApiSuccessResponse<null>> => {
    return apiClient.delete<ApiSuccessResponse<null>>(
      `/notifications/user/${userId}`,
    );
  },
};
