/**
 * Get Supplies Use Case - Application layer
 * Lấy danh sách vật tư từ kho
 */

import { IAdminRepository } from '../domain/admin.repository';
import { User } from '@/modules/auth/domain/user.entity';

export class GetListUserUseCase {
    constructor(private readonly adminRepository: IAdminRepository) { }

    async execute(): Promise<{
        users: User[]
        total: number
    }> {
        return this.adminRepository.getListUsers();
    }
}
