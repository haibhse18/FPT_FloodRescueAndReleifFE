/**
 * Auth Repository Interface - Domain layer
 * Định nghĩa contract cho auth operations, không phụ thuộc implementation
 */

import {
    User,

} from '@/modules/auth/domain/user.entity';

export interface IAdminRepository {


    /**
     * Lấy danh sách user
     * GET /users/
     */
    getListUser(): Promise<User[]>;



}
