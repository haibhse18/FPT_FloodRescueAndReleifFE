/**
 * Inventory Repository Interface - Domain layer
 * Định nghĩa contract cho inventory operations, không phụ thuộc implementation
 */

import { InventoryItem, CreateInventoryItemData, UpdateInventoryData } from './inventory.entity';

export interface IInventoryRepository {
    /**
     * Lấy danh sách inventory items
     */
    getItems(): Promise<InventoryItem[]>;

    /**
     * Tạo item mới
     */
    createItem(data: CreateInventoryItemData): Promise<InventoryItem>;

    /**
     * Cập nhật item
     */
    updateItem(id: string, data: UpdateInventoryData): Promise<InventoryItem>;

    /**
     * Xóa item
     */
    deleteItem(id: string): Promise<void>;

    /**
     * Import Excel
     */
    importExcel(file: File, importType: string): Promise<void>;
}
