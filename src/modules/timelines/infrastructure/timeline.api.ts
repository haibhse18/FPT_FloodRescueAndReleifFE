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

  /** PATCH /timelines/{id}/accept — Rescue Team accept → EN_ROUTE */
  acceptTimeline: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/accept`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/arrive — Rescue Team arrive → ON_SITE */
  arriveTimeline: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/arrive`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/complete — Rescue Team complete (outcome COMPLETED | PARTIAL) */
  completeTimeline: async (
    timelineId: string,
    input: { outcome: "COMPLETED" | "PARTIAL"; note?: string; rescuedCount?: number },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/complete`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/fail — Rescue Team mark failed */
  failTimeline: async (
    timelineId: string,
    input: { failureReason: string; note?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/fail`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/withdraw — Rescue Team withdraw */
  withdrawTimeline: async (
    timelineId: string,
    input: { withdrawalReason: string; note?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/withdraw`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
