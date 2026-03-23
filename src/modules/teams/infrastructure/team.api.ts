/**
 * Teams API - Infrastructure Layer
 * Handles team CRUD, member management, and leader assignment
 * Endpoints based on docs/Swagger/swagger.yaml
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const teamsApi = {
  // ────────────────────────────────────────────────────────
  // TEAM APPLICATIONS (CITIZEN)
  // ────────────────────────────────────────────────────────

  /** POST /team-applications — submit volunteer application */
  submitTeamApplication: async (input: {
    motivation: string;
    confirmPhoneNumber?: string;
  }): Promise<ApiResponse> => {
    return apiClient.post("/team-applications", input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /team-applications/my — list my volunteer applications */
  getMyTeamApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/team-applications/my?${query}` : "/team-applications/my";

    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /team-applications/:applicationId/withdraw — withdraw my application */
  withdrawTeamApplication: async (applicationId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/team-applications/${applicationId}/withdraw`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // CRUD
  // ────────────────────────────────────────────────────────

  /** GET /teams — list all teams (filter by status, search by name, sort) */
  getTeams: async (params?: {
    status?: string;
    name?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
    leader?: string;
    active?: number;
  }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/teams?${query}` : `/teams`;
    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** POST /teams — create a new team */
  createTeam: async (input: {
    name: string;
    leaderId?: string;
  }): Promise<ApiResponse> => {
    return apiClient.post("/teams", input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /teams/:teamId — get team detail with members */
  getTeamById: async (teamId: string): Promise<ApiResponse> => {
    return apiClient.get(`/teams/${teamId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /teams/:teamId — update team info */
  updateTeam: async (
    teamId: string,
    input: { name?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/teams/${teamId}`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** DELETE /teams/:teamId — delete team */
  deleteTeam: async (teamId: string): Promise<ApiResponse> => {
    return apiClient.delete(`/teams/${teamId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // LEADER
  // ────────────────────────────────────────────────────────

  /** PATCH /teams/:teamId/leader — change team leader (swagger field: newLeaderId) */
  changeLeader: async (
    teamId: string,
    input: { newLeaderId: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/teams/${teamId}/leader`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // MEMBERS
  // ────────────────────────────────────────────────────────

  /** POST /teams/:teamId/members — add member to team */
  addMember: async (
    teamId: string,
    input: { userId: string },
  ): Promise<ApiResponse> => {
    return apiClient.post(`/teams/${teamId}/members`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** DELETE /teams/:teamId/members/:uid — remove member from team */
  removeMember: async (
    teamId: string,
    userId: string,
  ): Promise<ApiResponse> => {
    return apiClient.delete(`/teams/${teamId}/members/${userId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // AVAILABLE USERS
  // ────────────────────────────────────────────────────────

  /** GET /users?role=Rescue Team&noTeam=true — get users eligible to join a team */
  getAvailableMembers: async (): Promise<ApiResponse> => {
    return apiClient.get("/users?role=Rescue Team&noTeam=true", {
      headers: authSession.getAuthHeaders(),
    });
  },
};
