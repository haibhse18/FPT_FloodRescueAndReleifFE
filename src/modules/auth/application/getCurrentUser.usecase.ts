/**
 * Get Current User Use Case - Application layer
 * Fetch và validate current user session
 */

import { IAuthRepository } from '../domain/auth.repository';
import { User } from '../domain/user.entity';

export class GetCurrentUserUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute get current user
     */
    async execute(): Promise<User> {
        const user = await this.authRepository.getCurrentUser();
        
        if (!user) {
            throw new Error('Không tìm thấy thông tin người dùng');
        }

        return user;
    }
}
