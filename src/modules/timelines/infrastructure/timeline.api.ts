/**
 * Timeline API - Infrastructure Layer
 * Handles timeline operations (Unified v2.2)
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const timelineApi = {
  /** GET /timelines — list with filters */
  getTimelines: async (params?: {
    missionId?: string;
    requestId?: string;
    teamId?: string;
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
    const endpoint = query ? `/timelines?${query}` : `/timelines`;
    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /timelines/{id} — detail */
  getTimelineDetail: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.get(`/timelines/${timelineId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/cancel — coordinator cancel timeline */
  cancelTimeline: async (
    timelineId: string,
    input?: { note?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/cancel`, input ?? {}, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
