/**
 * Logout Use Case - Application layer
 * Handle logout flow
 */

import { IAuthRepository } from '../domain/auth.repository';

export class LogoutUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute logout
     */
    async execute(): Promise<void> {
        await this.authRepository.logout();
    }
}
