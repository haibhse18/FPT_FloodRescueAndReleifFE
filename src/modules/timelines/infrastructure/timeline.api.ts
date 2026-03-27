/**
 * Timeline API - Infrastructure Layer
 * Handles timeline operations (Unified v2.2)
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";
import type {
  TimelineCompleteInput,
  TimelineFailInput,
  TimelineWithdrawInput,
} from "../domain/timeline.entity";

export const timelineApi = {
  /** GET /timelines — list with filters */
  getTimelines: async (params?: {
    missionId?: string;
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

  /** PATCH /timelines/{id}/accept — team accept assignment */
  acceptTimeline: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.patch(
      `/timelines/${timelineId}/accept`,
      {},
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /** POST /timelines/{id}/confirm-supply-claim — team confirms supply claim and moves to EN_ROUTE */
  confirmSupplyClaim: async (
    timelineId: string,
    note?: string,
  ): Promise<ApiResponse> => {
    return apiClient.post(
      `/timelines/${timelineId}/confirm-supply-claim`,
      { note },
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /** PATCH /timelines/{id}/arrive — team arrives on site */
  arriveTimeline: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.patch(
      `/timelines/${timelineId}/arrive`,
      {},
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /** POST /timelines/{id}/complete — team reports completion (unified API with auto-calculate outcome) */
  completeTimeline: async (
    timelineId: string,
    body: { note?: string },
  ): Promise<ApiResponse> => {
    return apiClient.post(`/timelines/${timelineId}/complete`, body, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/fail — team reports failure */
  failTimeline: async (
    timelineId: string,
    body: TimelineFailInput,
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/fail`, body, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timelines/{id}/withdraw — team withdraws from mission before executing */
  withdrawTimeline: async (
    timelineId: string,
    body: TimelineWithdrawInput,
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/timelines/${timelineId}/withdraw`, body, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
