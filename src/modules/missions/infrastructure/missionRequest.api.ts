/**
 * MissionRequest API - Infrastructure Layer
 * Handles mission request manual actions (Unified v2.2)
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const missionRequestApi = {
  /** GET /mission-requests — get all active mission requests */
  getAll: async (params?: { status?: string, page?: number, limit?: number }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/mission-requests?${query}` : `/mission-requests`;

    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /mission-requests/{id} — get detail */
  getById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/mission-requests/${id}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /mission-requests/{id}/close — manual close */
  close: async (id: string, input?: { note?: string }): Promise<ApiResponse> => {
    return apiClient.patch(`/mission-requests/${id}/close`, input || {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /mission-requests/{id}/drop — manual drop from mission */
  drop: async (id: string, input?: { note?: string }): Promise<ApiResponse> => {
    return apiClient.patch(`/mission-requests/${id}/drop`, input || {}, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
