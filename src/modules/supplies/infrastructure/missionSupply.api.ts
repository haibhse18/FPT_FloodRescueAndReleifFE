/**
 * MissionSupply API - Infrastructure Layer
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";
import type { GetMissionSuppliesFilter, MissionSupply } from "../domain/missionSupply.entity";

type MissionSupplyListResponse = ApiResponse<MissionSupply[]>;

const buildMissionSuppliesQuery = (filters: GetMissionSuppliesFilter = {}) => {
  const params = new URLSearchParams();

  if (filters.missionId) {
    params.set("missionId", filters.missionId);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    if (statuses.length > 0) {
      params.set("status", statuses.join(","));
    }
  }

  if (typeof filters.page === "number") {
    params.set("page", String(filters.page));
  }

  if (typeof filters.limit === "number") {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const missionSupplyApi = {
  /** GET /mission-supplies?missionId={id} — get supplies for a mission (team flow) */
  getMissionSupplies: async (missionId: string): Promise<MissionSupplyListResponse> => {
    return apiClient.get<MissionSupplyListResponse>(
      `/mission-supplies${buildMissionSuppliesQuery({ missionId })}`,
      {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /mission-supplies — flexible list for manager/global filters */
  getMissionSuppliesByQuery: async (
    filters: GetMissionSuppliesFilter = {},
  ): Promise<MissionSupplyListResponse> => {
    return apiClient.get<MissionSupplyListResponse>(
      `/mission-supplies${buildMissionSuppliesQuery(filters)}`,
      {
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
