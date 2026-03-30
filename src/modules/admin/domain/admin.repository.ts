/**
 * Auth Repository Interface - Domain layer
 * Định nghĩa contract cho auth operations, không phụ thuộc implementation
 */

import {
    User,
    UserRole

} from '@/modules/auth/domain/user.entity';

export interface IAdminRepository {

    getListUsers(): Promise<{ users: User[], total: number }>;

    updateUserRole(userId: string, role: UserRole): Promise<void>;

    deleteUser(userId: string): Promise<void>;
}
