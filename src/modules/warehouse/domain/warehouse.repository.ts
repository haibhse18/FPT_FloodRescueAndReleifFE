/**
 * Inventory Repository Interface - Domain layer
 * Định nghĩa contract cho inventory operations, không phụ thuộc implementation
 */

import { Warehouse } from './warehouse.entity';

export interface IWarehouseRepository {
    /**
     * Lấy danh sách inventory items
     */
    getWarehouses(): Promise<{ warehouses: Warehouse[], total: number }>;

    /**
     * Import Excel
     */
    importExcel(file: File): Promise<void>;
}
