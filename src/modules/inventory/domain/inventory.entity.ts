/**
 * Inventory Item Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Inventory, không phụ thuộc framework
 */

export type ItemCategory = 'food' | 'water' | 'medical' | 'equipment' | 'clothing' | 'other';

export type ItemStatus = 'available' | 'low' | 'out_of_stock' | 'expired';

export interface InventoryItem {
    id: string;
    name: string;
    category: ItemCategory;
    quantity: number;
    unit: string;
    minQuantity: number;
    status: ItemStatus;
    location?: string;
    expiryDate?: Date;
    lastUpdated: Date;
}

export interface UpdateInventoryData {
    quantity?: number;
    location?: string;
    expiryDate?: Date;
}

export interface CreateInventoryItemData {
    name: string;
    category: ItemCategory;
    quantity: number;
    unit: string;
    minQuantity: number;
    location?: string;
    expiryDate?: Date;
}
