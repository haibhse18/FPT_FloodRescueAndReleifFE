/**
 * Get List User Use Case - Application layer
 * Fetch danh sách người dùng từ hệ thống
 */

import { IAdminRepository } from "../domain/admin.repository";
import { User } from "@/modules/auth/domain/user.entity";

export interface GetListUserResponse {
    data: User[];
    meta?: {
        page: number;
        total: number;
        totalPages: number;
    };
}

export class GetListUserUseCase {
    constructor(private readonly adminRepository: IAdminRepository) { }

    /**
     * Execute get list users
     * GET /api/admin/users
     * @param query - query string (?page=1&limit=10...)
     * @returns GetListUserResponse
     */
    async execute(): Promise<User[]> {
        try {
            const result = await this.adminRepository.getListUser();

            if (!result || !Array.isArray(result)) {
                throw new Error('Dữ liệu người dùng không hợp lệ');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể lấy danh sách người dùng: ${error.message}`);
            }
            throw error;
        }
    }
}