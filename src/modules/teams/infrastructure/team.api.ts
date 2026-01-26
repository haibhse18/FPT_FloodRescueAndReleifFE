/**
 * Teams API - Infrastructure Layer
 * Handles rescue team operations
 */

import { apiClient } from '@/services/apiClient';
import { authSession } from '@/services/authSession';
import type { ApiResponse } from '@/shared/types/api';

export type RequestStatus = 'in_progress' | 'completed' | 'failed';

export interface UpdateRequestStatusDTO {
    status: RequestStatus;
    note?: string;
}

export interface LocationDTO {
    lat: number;
    lng: number;
}

export const teamsApi = {
    /**
     * Get assigned rescue requests for team
     * GET /rescue-team/assigned-requests
     */
    getAssignedRequests: async (): Promise<ApiResponse> => {
        return apiClient.get('/rescue-team/assigned-requests', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update rescue request status
     * PUT /rescue-team/requests/{requestId}/status
     */
    updateRequestStatus: async (
        requestId: string,
        data: UpdateRequestStatusDTO
    ): Promise<ApiResponse> => {
        return apiClient.put(`/rescue-team/requests/${requestId}/status`, data, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update team location
     * PUT /rescue-team/location
     */
    updateLocation: async (location: LocationDTO): Promise<ApiResponse> => {
        return apiClient.put('/rescue-team/location', location, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Report mission progress
     * POST /rescue-team/requests/{requestId}/progress
     */
    reportProgress: async (requestId: string, progress: string): Promise<ApiResponse> => {
        return apiClient.post(
            `/rescue-team/requests/${requestId}/progress`,
            { progress },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },
};
