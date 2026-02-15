import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import { ApiResponse } from "@/shared/types/api";

/**
 * Coordinator API
 * - Quản lý requests (xem tất cả, verify, set priority)
 * - Phân công missions
 * - Theo dõi team positions
 */
export const coordinatorApi = {
    /**
     * Lấy tất cả requests (không giới hạn theo user)
     * Hỗ trợ filter: status, type, incidentType, priority, userName, page, limit
     */
    getAllRequests: async (params?: {
        status?: string;
        type?: string;
        incidentType?: string;
        priority?: string;
        userName?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse> => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/requests/getAll?${query}` : `/requests/getAll`;

        return apiClient.get(endpoint, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Lấy chi tiết 1 request
     */
    getRequestDetail: async (requestId: string): Promise<ApiResponse> => {
        return apiClient.get(`/requests/${requestId}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Cập nhật status của request
     * Status: Pending | In Progress | Completed | Cancelled
     */
    updateRequestStatus: async (
        requestId: string,
        status: string
    ): Promise<ApiResponse> => {
        return apiClient.patch(
            `/requests/${requestId}/status`,
            { status },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },

    /**
     * Cập nhật priority của request
     * Priority: critical | high | normal
     */
    updateRequestPriority: async (
        requestId: string,
        priority: string
    ): Promise<ApiResponse> => {
        return apiClient.patch(
            `/requests/${requestId}/priority`,
            { priority },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },

    /**
     * Tạo mission mới (assign team to request)
     */
    createMission: async (data: {
        teamId: string;
        requestIds: string[];
        vehicleId?: string;
    }): Promise<ApiResponse> => {
        return apiClient.post("/missions", data, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Reassign mission cho team khác
     */
    reassignMission: async (
        missionId: string,
        teamId: string
    ): Promise<ApiResponse> => {
        return apiClient.patch(
            `/missions/${missionId}/reassign`,
            { teamId },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },

    /**
     * Lấy vị trí của team trong mission
     */
    getMissionPositions: async (missionId: string): Promise<ApiResponse> => {
        return apiClient.get(`/missions/${missionId}/positions`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Lấy danh sách missions
     */
    getAllMissions: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse> => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/missions?${query}` : `/missions`;

        return apiClient.get(endpoint, {
            headers: authSession.getAuthHeaders(),
        });
    },
};
