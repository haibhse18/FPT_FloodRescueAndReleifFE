/**
 * Missions/Coordinator API - Infrastructure Layer
 * Handles mission coordination and team assignment
 */

import { apiClient } from '@/services/apiClient';
import { authSession } from '@/services/authSession';
import type { ApiResponse } from '@/shared/types/api';

export interface GetAllRequestsParams {
    status?: string;
    urgency?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface AssignTeamDTO {
    teamId: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface UpdatePriorityDTO {
    priority: PriorityLevel;
}

export const coordinatorApi = {
    /**
     * Get all rescue requests for coordination
     * GET /coordinator/requests
     */
    getAllRequests: async (filters?: GetAllRequestsParams): Promise<ApiResponse> => {
        const params = new URLSearchParams(filters as Record<string, string>);
        const queryString = filters ? `?${params}` : '';
        return apiClient.get(`/coordinator/requests${queryString}`, {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Assign rescue team to request
     * POST /coordinator/requests/{requestId}/assign
     */
    assignRescueTeam: async (requestId: string, teamId: string): Promise<ApiResponse> => {
        return apiClient.post(
            `/coordinator/requests/${requestId}/assign`,
            { teamId },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },

    /**
     * Get available rescue teams
     * GET /coordinator/rescue-teams
     */
    getRescueTeams: async (): Promise<ApiResponse> => {
        return apiClient.get('/coordinator/rescue-teams', {
            headers: authSession.getAuthHeaders(),
        });
    },

    /**
     * Update request priority
     * PUT /coordinator/requests/{requestId}/priority
     */
    updateRequestPriority: async (
        requestId: string,
        priority: PriorityLevel
    ): Promise<ApiResponse> => {
        return apiClient.put(
            `/coordinator/requests/${requestId}/priority`,
            { priority },
            {
                headers: authSession.getAuthHeaders(),
            }
        );
    },
};
