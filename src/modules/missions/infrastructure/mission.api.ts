/**
 * Missions/Coordinator API - Infrastructure Layer
 * Handles mission coordination and team assignment
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export interface GetAllRequestsParams {
  status?: string;
  urgency?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AssignTeamDTO {
  teamId: string;
}

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export interface UpdatePriorityDTO {
  priority: PriorityLevel;
}

export const missionApi = {
  /**
   * Get all rescue requests for coordination
   * GET /coordinator/requests
   */
  getAllRequests: async (
    filters?: GetAllRequestsParams,
  ): Promise<ApiResponse> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const queryString = filters ? `?${params}` : "";
    return apiClient.get(`/coordinator/requests${queryString}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Assign rescue team to request
   * POST /coordinator/requests/{requestId}/assign
   */
  assignRescueTeam: async (
    requestId: string,
    teamId: string,
  ): Promise<ApiResponse> => {
    return apiClient.post(
      `/coordinator/requests/${requestId}/assign`,
      { teamId },
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /**
   * Get available rescue teams
   * GET /coordinator/rescue-teams
   */
  getRescueTeams: async (): Promise<ApiResponse> => {
    return apiClient.get("/coordinator/rescue-teams", {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Update request priority
   * PUT /coordinator/requests/{requestId}/priority
   */
  updateRequestPriority: async (
    requestId: string,
    priority: PriorityLevel,
  ): Promise<ApiResponse> => {
    return apiClient.put(
      `/coordinator/requests/${requestId}/priority`,
      { priority },
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },
  /**
   * Create mission (assign team to multiple requests)
   * POST /missions
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
   * Reassign mission
   * PATCH /missions/{missionId}/reassign
   */
  reassignMission: async (
    missionId: string,
    teamId: string,
  ): Promise<ApiResponse> => {
    return apiClient.patch(
      `/missions/${missionId}/reassign`,
      { teamId },
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /**
   * Get mission positions
   * GET /missions/{missionId}/positions
   */
  getMissionPositions: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.get(`/missions/${missionId}/positions`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Get all missions
   * GET /missions
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
