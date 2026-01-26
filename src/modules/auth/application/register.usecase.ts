/**
 * Register Use Case - Application layer
 * Orchestrate registration flow với business logic
 */

import { IAuthRepository } from '../domain/auth.repository';
import { RegisterData, AuthTokens } from '../domain/user.entity';

export class RegisterUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Execute registration với validation
     */
    async execute(data: RegisterData, confirmPassword: string): Promise<AuthTokens> {
        // Validate required fields
        if (!data.email) {
            throw new Error('Email là bắt buộc');
        }

        if (!data.password) {
            throw new Error('Mật khẩu là bắt buộc');
        }

        if (!data.fullName) {
            throw new Error('Họ tên là bắt buộc');
        }

        if (!data.phoneNumber) {
            throw new Error('Số điện thoại là bắt buộc');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Email không hợp lệ');
        }

        // Validate phone format (Vietnam)
        const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
        if (!phoneRegex.test(data.phoneNumber)) {
            throw new Error('Số điện thoại không hợp lệ');
        }

        // Validate password match
        if (data.password !== confirmPassword) {
            throw new Error('Mật khẩu không khớp');
        }

        // Validate password strength
        if (data.password.length < 6) {
            throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        }

        // Call repository
        const tokens = await this.authRepository.register(data);

        return tokens;
    }
}
