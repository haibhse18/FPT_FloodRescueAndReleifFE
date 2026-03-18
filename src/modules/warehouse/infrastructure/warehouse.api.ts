import { ApiResponse } from '@/types';
import axiosInstance from '@/lib/axios';
import { uploadFile } from '@/services/uploadFile';
import { Warehouse } from '../domain/warehouse.entity';



export const warehouseApi = {

    /**
        * GET /api/warehouses
        */
    getWarehouses: async (query?: string) => {
        try {
            const response = await axiosInstance.get(
                "/warehouse/" + (query || "")
            );

            return response.data;
            // { data: Vehicle[], meta: { page, totalPages, limit, total } }

        } catch (error) {
            console.error("[WarehouseAPI] Error fetching warehouses:", error);
            return { data: [], meta: { page: 1, totalPages: 1 } };
        }
    },
    importExcel: async (file: File): Promise<void> => {
        await uploadFile<ApiResponse<{ message: string, total: number }>>(
            "/warehouse/import",
            file,
        );
    },
}