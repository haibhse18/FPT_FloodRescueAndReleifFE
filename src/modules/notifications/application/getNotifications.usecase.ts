/**
 * Get Notifications Use Case - Application layer
 * Handle fetching notifications with pagination
 */

import { INotificationRepository } from "../domain/notification.repository";
import { NotificationListResponse } from "../domain/notification.entity";

export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  /**
   * Get notifications for a user
   */
  async execute(page = 1, limit = 10): Promise<NotificationListResponse> {
    return this.notificationRepository.getNotifications(page, limit);
  }
}
