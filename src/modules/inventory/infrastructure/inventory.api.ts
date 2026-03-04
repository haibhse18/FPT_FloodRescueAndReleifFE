/**
 * Inventory API Adapter - Infrastructure layer
 * Direct API calls cho inventory operations
 */

import { InventoryItem } from '../domain/inventory.entity';
import { ApiResponse } from '@/types';
import axiosInstance from '@/lib/axios';

export const inventoryApi = {
    /**
     * GET /api/inventory
     * optional querystring (keyword, page, limit)
     */
    getItems: async (query?: string): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get<ApiResponse<InventoryItem[]>>(
            `/inventory/list` + (query || '')
        );
        if (!response.data.data) {
            throw new Error('Không nhận được dữ liệu tồn kho');
        }
        return response.data.data;
    },

    /**
     * GET /api/inventory/:id
     */
    getItemById: async (id: string): Promise<InventoryItem> => {
        const response = await axiosInstance.get<ApiResponse<InventoryItem>>(
            `/inventory/${id}`
        );
        if (!response.data.data) {
            throw new Error('Không nhận được thông tin item');
        }
        return response.data.data;
    },

    // more methods (create, update, delete) can be added as needed
};
