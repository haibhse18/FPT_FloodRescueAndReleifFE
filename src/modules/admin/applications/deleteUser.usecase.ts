/**
 * Delete User Use Case - Application layer
 */
import { IAdminRepository } from "../domain/admin.repository";

export class DeleteUserUseCase {
    constructor(private readonly adminRepository: IAdminRepository) { }

    async execute(userId: string): Promise<void> {
        try {
            await this.adminRepository.deleteUser(userId);
        } catch (error) {
            throw error;
        }
    }
}
