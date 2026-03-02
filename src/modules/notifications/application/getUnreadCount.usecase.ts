/**
 * Get Unread Count UseCase - Application Layer
 * Lấy số lượng thông báo chưa đọc (derived from notification list)
 */

import { INotificationRepository } from "../domain/notification.repository";

export class GetUnreadCountUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<number> {
    const result = await this.notificationRepository.getNotifications(1, 100);
    return result.data.filter((n) => !n.isRead).length;
  }
}
