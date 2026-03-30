import { UserRole } from "@/modules/auth/domain/user.entity";
import { adminApi } from "./admin.api";
import { IAdminRepository } from "../domain/admin.repository";

export class AdminRepositoryImpl implements IAdminRepository {

    async getListUsers() {
        const result = await adminApi.getListUsers();

        return {
            users: result?.data ?? [],
            total: result?.meta?.total ?? 0
        };
    }
    async updateUserRole(userId: string, role: UserRole): Promise<void> {
        await adminApi.updateUserRole(userId, role);
    }

    async deleteUser(userId: string): Promise<void> {
        await adminApi.deleteUser(userId);
    }
}

export const adminRepository = new AdminRepositoryImpl();