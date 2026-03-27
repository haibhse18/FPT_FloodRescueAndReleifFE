import { User, UserRole } from "@/modules/auth/domain/user.entity";
import { ApiResponse } from "@/types";
import axiosInstance from "@/lib/axios";

export const adminApi = {

    getListUsers: async (query?: string) => {
        try {
            const response = await axiosInstance.get(
                "/users/" + (query || "")
            );

            return response.data;
        } catch (error) {
            console.error("[AdminAPI] Error fetching users:", error);
            return { data: [], meta: { page: 1, totalPages: 1 } };
        }
    },

    updateUserRole: async (userId: string, role: string): Promise<void> => {
        await axiosInstance.patch(`/users/${userId}/role`, { role });
    },

    deleteUser: async (userId: string): Promise<void> => {
        await axiosInstance.delete(`/users/${userId}`);
    },
    updateUserStatus: async (id: string, status: string) => {
        await axiosInstance.patch(`/users/${id}/status`, { status });
    },

    createUser: async (data: {
        userName: string;
        displayName: string;
        email: string;
        phone?: string;
        password: string;
        role: UserRole;
    }): Promise<void> => {
        await axiosInstance.post("/users", data);
    },
};