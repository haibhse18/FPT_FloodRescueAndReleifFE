/**
 * Get Current User Use Case - Application layer
 * Fetch và validate current user session
 */

import { IAuthRepository } from '../domain/auth.repository';
import { GetCurrentUserResponse } from '../domain/user.entity';

export class GetCurrentUserUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute get current user
     * GET /api/auth/me
     * @returns GetCurrentUserResponse - { user, role }
     */
    async execute(): Promise<GetCurrentUserResponse> {
        try {
            const response = await this.authRepository.getCurrentUser();
            
            if (!response) {
                throw new Error('Không nhận được phản hồi từ server');
            }

            // API trả về User object trực tiếp
            if (!response.userName || !response.email) {
                throw new Error('Dữ liệu người dùng không hợp lệ');
            }

            return response;
        } catch (error) {
            // Nếu lỗi là 401 Unauthorized, có thể user chưa đăng nhập hoặc session hết hạn
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    throw new Error('Vui lòng đăng nhập lại');
                }
            }
            throw error;
        }
    }
}
