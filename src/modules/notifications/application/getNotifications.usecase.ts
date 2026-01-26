/**
 * Get Notifications Use Case - Application layer
 * Handle fetching notifications
 */

import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';

export class GetNotificationsUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    /**
     * Get all notifications
     */
    async execute(): Promise<Notification[]> {
        return this.notificationRepository.getNotifications();
    }
}
