/**
 * Refresh Token Use Case - Application layer
 * Handle refresh token flow
 */

import { IAuthRepository } from '../domain/auth.repository';
import { RefreshResponse } from '../domain/user.entity';

export class RefreshTokenUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute refresh token
     * POST /api/auth/refresh
     * @returns RefreshResponse - { accessToken, user }
     */
    async execute(): Promise<RefreshResponse> {
        const response = await this.authRepository.refreshToken();
        
        if (!response || !response.accessToken) {
            throw new Error('Không thể làm mới phiên đăng nhập');
        }

        return response;
    }
}
