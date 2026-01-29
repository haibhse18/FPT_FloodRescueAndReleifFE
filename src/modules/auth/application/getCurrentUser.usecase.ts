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
        const response = await this.authRepository.getCurrentUser();
        
        if (!response || !response.user) {
            throw new Error('Không tìm thấy thông tin người dùng');
        }

        return response;
    }
}
