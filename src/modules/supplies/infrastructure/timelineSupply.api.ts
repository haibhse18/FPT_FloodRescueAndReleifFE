/**
 * TimelineSupply API - Infrastructure Layer
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";
import type { ClaimSupplyInput } from "../domain/timelineSupply.entity";

export const timelineSupplyApi = {
  /** GET /timeline-supplies?timelineId={id} — get supplies claimed by a timeline */
  getTimelineSupplies: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.get(`/timeline-supplies?timelineId=${timelineId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** POST /timeline-supplies/claim — claim a supply for a timeline */
  claimSupply: async (input: ClaimSupplyInput): Promise<ApiResponse> => {
    return apiClient.post(`/timeline-supplies/claim`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** POST /timeline-supplies/return — return leftover supplies */
  returnSupply: async (timelineId: string, missionSupplyId: string): Promise<ApiResponse> => {
    return apiClient.post(`/timeline-supplies/return`, {
      timelineId,
      missionSupplyId,
    }, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
