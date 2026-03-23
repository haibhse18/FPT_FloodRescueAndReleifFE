/**
 * TeamRequest API - Infrastructure Layer
 * Handles team request operations
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";
import type { CompleteTeamRequestInput } from "../domain/teamRequest.entity";

export const teamRequestApi = {
  /** GET /team-requests — list with filters */
  getTeamRequests: async (params?: {
    missionId?: string;
    missionRequestId?: string;
    teamId?: string;
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
    const endpoint = query ? `/team-requests?${query}` : `/team-requests`;
    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /team-requests/{id} — detail */
  getTeamRequestDetail: async (teamRequestId: string): Promise<ApiResponse> => {
    return apiClient.get(`/team-requests/${teamRequestId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** POST /team-requests/{id}/complete — complete team request */
  completeTeamRequest: async (
    teamRequestId: string,
    input: CompleteTeamRequestInput,
  ): Promise<ApiResponse> => {
    return apiClient.post(`/team-requests/${teamRequestId}/complete`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
