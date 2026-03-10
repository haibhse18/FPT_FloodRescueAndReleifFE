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
    getItems: async (query?: string): Promise<{ data: InventoryItem[], meta: { page: number, totalPages: number } }> => {
        try {
        const response = await axiosInstance.get<ApiResponse<InventoryItem[]>>(
            `/inventory/list` + (query || '') 
        );
         const data = response.data?.data;  
        if (!Array.isArray(data)) {
            console.warn('[InventoryAPI] Data is not array. Full response:', response.data);
            return { data: [], meta: { page: 1, totalPages: 1 } };
        }
        return { data, meta: response.data?.meta || { page: 1, totalPages: 1 } };
        } catch (error) {
        console.error('[InventoryAPI] Error fetching inventory items:', error);
        return { data: [], meta: { page: 1, totalPages: 1 } }; 
    }
    },

    /**
     * GET /api/inventory/:id
     */
    getItemByName: async (name: string): Promise<InventoryItem> => {
        const response = await axiosInstance.get<ApiResponse<InventoryItem>>(
            `/inventory${name}`
        );
        if (!response.data.data) {
            throw new Error('Không nhận được thông tin item');
        }
        return response.data.data;
    },

    // more methods (create, update, delete) can be added as needed
};
