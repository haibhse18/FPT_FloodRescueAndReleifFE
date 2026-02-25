/**
 * Missions API - Infrastructure Layer
 * Handles mission CRUD, assignment, and status control (Unified v2.2)
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const missionApi = {
  // ────────────────────────────────────────────────────────
  // CRUD
  // ────────────────────────────────────────────────────────

  /** POST /missions — create mission (status = PLANNED) */
  createMission: async (input: {
    name: string;
    type: string;
    description?: string;
    priority?: string;
  }): Promise<ApiResponse> => {
    return apiClient.post("/missions", input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /missions — list with filters */
  getMissions: async (params?: {
    status?: string;
    type?: string;
    code?: string;
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

  /** GET /missions/{id} — detail */
  getMissionDetail: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.get(`/missions/${missionId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /missions/{id} — update name/desc/priority */
  updateMission: async (
    missionId: string,
    input: { name?: string; description?: string; priority?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/missions/${missionId}`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** DELETE /missions/{id} */
  deleteMission: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.delete(`/missions/${missionId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // ASSIGNMENT
  // ────────────────────────────────────────────────────────

  /** PATCH /missions/{id}/assign — assign team + request → creates Timeline */
  assignTeam: async (
    missionId: string,
    input: { teamId: string; requestId: string; note?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/missions/${missionId}/assign`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // STATUS CONTROL
  // ────────────────────────────────────────────────────────

  /** PATCH /missions/{id}/pause — IN_PROGRESS → PAUSED */
  pauseMission: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/missions/${missionId}/pause`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /missions/{id}/resume — PAUSED → IN_PROGRESS */
  resumeMission: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/missions/${missionId}/resume`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /missions/{id}/abort — → ABORTED (auto-cancel active timelines) */
  abortMission: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/missions/${missionId}/abort`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  // ────────────────────────────────────────────────────────
  // TEAMS
  // ────────────────────────────────────────────────────────

  /** GET /teams — list available teams */
  getTeams: async (params?: { status?: string }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString();
    const endpoint = query ? `/teams?${query}` : `/teams`;
    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
