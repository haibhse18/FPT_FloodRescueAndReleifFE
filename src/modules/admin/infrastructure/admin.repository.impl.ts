import { User } from "@/modules/auth/domain/user.entity";
import { adminApi } from "./admin.api";

export class AdminRepositoryImpl {

    async getListUser(): Promise<User[]> {
        const result = await adminApi.getListUsers();
        return result?.data ?? [];
    }
}

export const adminRepository = new AdminRepositoryImpl();