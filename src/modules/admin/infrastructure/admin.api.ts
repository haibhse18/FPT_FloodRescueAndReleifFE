/**
 * Auth API Adapter - Infrastructure layer
 * Direct API calls cho authentication
 */

import {
    User,
} from "@/modules/auth/domain/user.entity";
import { ApiResponse } from "@/types";
import axiosInstance from "@/lib/axios";

/**
 * Auth API methods
 */
export const adminApi = {


    /**
     * GET /users/
     */
    getListUsers: async (query?: string): Promise<{ data: User[], meta: { page: number, totalPages: number } }> => {
        try {
            const response = await axiosInstance.get<ApiResponse<User[]>>(
                '/users/' + (query || '')
            );
            const data = response.data?.data;
            if (!Array.isArray(data)) {
                console.warn('[AdminAPI] Data is not array. Full response:', response.data);
                return { data: [], meta: { page: 1, totalPages: 1 } };
            }
            return { data, meta: response.data?.meta || { page: 1, totalPages: 1 } };
        } catch (error) {
            console.error('[AdminAPI] Error fetching supplies:', error);
            return { data: [], meta: { page: 1, totalPages: 1 } };
        }
    },


};
