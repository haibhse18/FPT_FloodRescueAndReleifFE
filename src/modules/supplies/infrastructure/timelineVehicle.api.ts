/**
 * TimelineVehicle API - Infrastructure Layer
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const timelineVehicleApi = {
  /** GET /timeline-vehicles?timelineId={id} — get vehicles for a timeline */
  getTimelineVehicles: async (timelineId: string): Promise<ApiResponse> => {
    return apiClient.get(`/timeline-vehicles?timelineId=${timelineId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-vehicles/:id/claim — claim a vehicle (per-item) */
  claimVehicle: async (timelineVehicleId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-vehicles/${timelineVehicleId}/claim`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-vehicles/:id/return — return a vehicle */
  returnVehicle: async (timelineVehicleId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-vehicles/${timelineVehicleId}/return`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-vehicles/:id/approve — manager approves vehicle */
  approveVehicle: async (timelineVehicleId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-vehicles/${timelineVehicleId}/approve`, {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /timeline-vehicles/:id/reject — manager rejects vehicle */
  rejectVehicle: async (timelineVehicleId: string, note?: string): Promise<ApiResponse> => {
    return apiClient.patch(`/timeline-vehicles/${timelineVehicleId}/reject`, 
      note ? { note } : {}, 
      {
        headers: authSession.getAuthHeaders(),
      }
    );
  },
};
