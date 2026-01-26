/**
 * Login Use Case - Application layer
 * Orchestrate login flow với business logic
 */

import { IAuthRepository } from '../domain/auth.repository';
import { LoginCredentials, AuthTokens } from '../domain/user.entity';

export class LoginUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute login với validation
     */
    async execute(credentials: LoginCredentials): Promise<AuthTokens> {
        // Validate credentials
        if (!credentials.password) {
            throw new Error('Mật khẩu là bắt buộc');
        }

        if (!credentials.phoneNumber && !credentials.email) {
            throw new Error('Số điện thoại hoặc email là bắt buộc');
        }

        // Call repository
        const tokens = await this.authRepository.login(credentials);

        return tokens;
    }
}
