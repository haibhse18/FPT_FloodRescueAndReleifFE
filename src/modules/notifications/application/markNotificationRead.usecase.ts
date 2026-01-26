/**
 * Mark Notification Read Use Case - Application layer
 * Handle marking notifications as read
 */

import { INotificationRepository } from '../domain/notification.repository';

export class MarkNotificationReadUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    /**
     * Mark a notification as read
     */
    async execute(notificationId: string): Promise<void> {
        if (!notificationId) {
            throw new Error('ID thông báo là bắt buộc');
        }

        await this.notificationRepository.markAsRead(notificationId);
    }

    /**
     * Mark all notifications as read
     */
    async executeAll(): Promise<void> {
        await this.notificationRepository.markAllAsRead();
    }
}
