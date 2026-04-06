/**
 * MissionSupply API - Infrastructure Layer
 */

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { GetMissionSuppliesFilter, MissionSupply } from "../domain/missionSupply.entity";

type MissionSupplyListResponse = { data: MissionSupply[], meta: { page: number, totalPages: number, total: number } };

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
    try {
      const response = await axiosInstance.get<ApiResponse<MissionSupply[]>>(
        `/mission-supplies${buildMissionSuppliesQuery({ missionId })}`
      );
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        console.warn("[MissionSupplyAPI] Data is not array. Full response:", response.data);
        return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
      }
      return { data, meta: response.data?.meta || { page: 1, totalPages: 1, total: 0 } };
    } catch (error) {
      console.error("[MissionSupplyAPI] Error fetching mission supplies:", error);
      return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
    }
  },

  /** GET /mission-supplies — flexible list for manager/global filters */
  getMissionSuppliesByQuery: async (
    filters: GetMissionSuppliesFilter = {},
  ): Promise<MissionSupplyListResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<MissionSupply[]>>(
        `/mission-supplies${buildMissionSuppliesQuery(filters)}`
      );
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        console.warn("[MissionSupplyAPI] Data is not array. Full response:", response.data);
        return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
      }
      return { data, meta: response.data?.meta || { page: 1, totalPages: 1, total: 0 } };
    } catch (error) {
      console.error("[MissionSupplyAPI] Error fetching mission supplies by query:", error);
      return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
    }
  },

  /** PATCH /mission-supplies/:id/allocate — update allocation */
  allocateMissionSupply: async (
    id: string,
    payload: {
      warehouseId?: string;
      allocatedQty?: number;
      actualQty?: number;
      status?: "REQUESTED" | "ALLOCATED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
    }
  ): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      `/mission-supplies/${id}/allocate`,
      payload
    );
  },
};
