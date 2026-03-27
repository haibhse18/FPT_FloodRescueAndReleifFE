/**
 * MissionSupply API - Infrastructure Layer
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export const missionSupplyApi = {
  /** GET /mission-supplies?missionId={id} — get supplies for a mission */
  getMissionSupplies: async (missionId: string): Promise<ApiResponse> => {
    return apiClient.get(`/mission-supplies?missionId=${missionId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /mission-supplies/{id} — get single mission supply detail */
  getMissionSupplyDetail: async (missionSupplyId: string): Promise<ApiResponse> => {
    return apiClient.get(`/mission-supplies/${missionSupplyId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
