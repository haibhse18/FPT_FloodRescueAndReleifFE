/**
 * TimelineSupply API - Infrastructure Layer
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const timelineSupplyApi = {
  /** GET /timeline-supplies?timelineId={id} — get supplies for a timeline */
  getTimelineSupplies: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.get(`/timeline-supplies?timelineId=${timelineId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-supplies/:id/claim — claim a supply (per-item) */
  claimSupply: async (timelineSupplyId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-supplies/${timelineSupplyId}/claim`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-supplies/:id/return — return a supply */
  returnSupply: async (timelineSupplyId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-supplies/${timelineSupplyId}/return`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-supplies/:id/approve — manager approves supply */
  approveSupply: async (timelineSupplyId: string, approvedQty?: number): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-supplies/${timelineSupplyId}/approve`, 
      approvedQty !== undefined ? { approvedQty } : {}, 
      {
        headers: authSession.getAuthHeaders(),
      }
    );
  },

  /** PATCH /timeline-supplies/:id/reject — manager rejects supply */
  rejectSupply: async (timelineSupplyId: string, note?: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-supplies/${timelineSupplyId}/reject`, 
      note ? { note } : {}, 
      {
        headers: authSession.getAuthHeaders(),
      }
    );
  },
};
