/**
 * Update Profile Use Case - Application layer
 * Handle updating user profile
 */

import { IUserRepository } from '../domain/user.repository';
import { UpdateProfileData } from '../domain/user.entity';

export class UpdateProfileUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    /**
     * Update user profile with validation
     */
    async execute(data: UpdateProfileData): Promise<void> {
        // Validate phone format if provided
        if (data.phone) {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (!phoneRegex.test(data.phone)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
        }

        await this.userRepository.updateProfile(data);
    }
}
