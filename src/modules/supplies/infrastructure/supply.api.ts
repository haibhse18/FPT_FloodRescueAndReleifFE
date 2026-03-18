/**
 * Supply API Adapter - Infrastructure layer
 * Direct API calls cho supply operations
 */

import {
  Supply,
  SupplyRequest,
  CreateSupplyRequestData,
} from '../domain/supply.entity';
import { ApiResponse } from '@/types';
import axiosInstance from '@/lib/axios';
import { uploadFile } from '../../../services/uploadFile';

/**
 * Supply API methods
 */
export const supplyApi = {

  /**
  * POST /api/supply/import
  * Import supplies from Excel
  */
  importExcel: async (file: File) => {
    const response = await uploadFile<ApiResponse<{ message: string, total: number }>>(
      "/supply/import",
      file
    );

    return response.data;
  },

  /**
   * GET /api/supply  (backend mounts supply routes at /api/supply)
   * Fetches all supplies from backend
   */
  getSupplies: async (query?: string): Promise<{ data: Supply[], meta: { page: number, totalPages: number, total: number } }> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Supply[]>>(
        '/supply/list' + (query || '')
      );
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        console.warn('[SupplyAPI] Data is not array. Full response:', response.data);
        return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
      }
      return { data, meta: response.data?.meta || { page: 1, totalPages: 1, total: 0 } };
    } catch (error) {
      console.error('[SupplyAPI] Error fetching supplies:', error);
      return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
    }
  },

  /**
   * GET /api/supply/requests  (example; adjust if backend path differs)
   */
  getSupplyRequests: async (status?: string): Promise<SupplyRequest[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SupplyRequest[]>>(
        "/supply/status/" + (status || "IN_PROGRESS")
      );

      const data = response.data?.data;

      if (!Array.isArray(data)) {
        console.warn("[SupplyAPI] Data is not array. Full response:", response.data);
        return [];
      }

      return data;
    } catch (error) {
      console.error("[SupplyAPI] Error fetching supplies:", error);
      return [];
    }
  },

  /**
   * POST /api/supply/requests
   */
  createSupplyRequest: async (data: CreateSupplyRequestData): Promise<SupplyRequest> => {
    const response = await axiosInstance.post<ApiResponse<SupplyRequest>>(
      '/supply/requests',
      data
    );
    if (!response.data.data) {
      throw new Error('Không nhận được dữ liệu phản hồi');
    }
    return response.data.data;
  },

  /**
   * PATCH /api/supply/:id/status
   */
  updateSupplyStatus: async (id: string, status: string): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      `/supply/${id}/status`,
      { status }
    );
  },
};
