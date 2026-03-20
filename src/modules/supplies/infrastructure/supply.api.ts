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
    * @deprecated Legacy endpoint, not present in current Swagger.
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
     * GET /api/supplies (NEW Swagger endpoint)
     * Fallback to GET /api/supply/list (legacy)
     * Fetches all supplies from backend
     * 
     * Note: Citizens may not have permission to access this endpoint.
     * If 401/403, returns empty array (supplies mapping will be skipped).
     */
    getSupplies: async (query?: string): Promise<{ data: Supply[], meta: { page: number, totalPages: number, total: number } }> => {
        try {
            // Try new Swagger endpoint first
            const response = await axiosInstance.get<ApiResponse<Supply[]>>(
                '/supplies' + (query || '')
            );
            const data = response.data?.data;
            if (!Array.isArray(data)) {
                console.warn('[SupplyAPI] Data is not array. Full response:', response.data);
                return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
            }
            return { data, meta: response.data?.meta || { page: 1, totalPages: 1, total: 0 } };
        } catch (error: any) {
            // If unauthorized/forbidden, return empty (citizen may not have permission)
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn('[SupplyAPI] User does not have permission to access /supplies (403/401). Supplies mapping will be skipped.');
                return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
            }

            console.warn('[SupplyAPI] /supplies endpoint failed (not 403/401), trying fallback /supply/list:', error);
            try {
                // Fallback to legacy endpoint
                const fallbackResponse = await axiosInstance.get<ApiResponse<Supply[]>>(
                    '/supply/list' + (query || '')
                );
                const data = fallbackResponse.data?.data;
                if (!Array.isArray(data)) {
                    console.warn('[SupplyAPI] Fallback data is not array. Full response:', fallbackResponse.data);
                    return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
                }
                console.log('[SupplyAPI] Successfully loaded supplies from fallback endpoint');
                return { data, meta: fallbackResponse.data?.meta || { page: 1, totalPages: 1, total: 0 } };
            } catch (fallbackError: any) {
                // If fallback also fails due to permission, return empty
                if (fallbackError.response?.status === 401 || fallbackError.response?.status === 403) {
                    console.warn('[SupplyAPI] User does not have permission to access /supply/list either (403/401). Supplies mapping will be skipped.');
                    return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
                }
                console.error('[SupplyAPI] Both /supplies and /supply/list failed:', fallbackError);
                return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
            }
        }
    },

    /**
     * @deprecated No GET endpoint for supply requests in current Swagger.
     * Inventory section exposes POST /api/relief-distributions only.
     */
    getSupplyRequests: async (status?: string): Promise<SupplyRequest[]> => {
        throw new Error(
            "Endpoint GET /api/supply/status/* khong co trong Swagger hien tai. Vui long dung flow Inventory/Relief Distribution.",
        );
    },

    /**
     * POST /api/relief-distributions
     */
    createSupplyRequest: async (data: CreateSupplyRequestData): Promise<SupplyRequest> => {
        const response = await axiosInstance.post<ApiResponse<SupplyRequest>>(
            '/relief-distributions',
            data
        );
        if (!response.data.data) {
            throw new Error('Không nhận được dữ liệu phản hồi');
        }
        return response.data.data;
    },

    /**
     * PATCH /api/inventory/{id}
     */
    updateSupplyStatus: async (id: string, status: string): Promise<void> => {
        await axiosInstance.patch<ApiResponse<void>>(
            `/inventory/${id}`,
            { status }
        );
    },
};
