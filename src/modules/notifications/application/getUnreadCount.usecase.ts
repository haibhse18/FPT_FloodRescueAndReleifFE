/**
 * Get Unread Count UseCase - Application Layer
 * Lấy số lượng thông báo chưa đọc
 */

import { INotificationRepository } from '../domain/notification.repository';

export class GetUnreadCountUseCase {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(): Promise<number> {
        return await this.notificationRepository.getUnreadCount();
    }
}
