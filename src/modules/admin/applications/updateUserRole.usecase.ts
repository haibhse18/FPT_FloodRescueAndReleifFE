/**
 * Update User Role Use Case - Application layer
 */
import { IAdminRepository } from "../domain/admin.repository";
import { UserRole } from "@/modules/auth/domain/user.entity";

export class UpdateUserRoleUseCase {
    constructor(private readonly adminRepository: IAdminRepository) { }

    async execute(userId: string, role: string): Promise<void> {
        try {
            await this.adminRepository.updateUserRole(userId, role);
        } catch (error) {
            throw error;
        }
    }
}
