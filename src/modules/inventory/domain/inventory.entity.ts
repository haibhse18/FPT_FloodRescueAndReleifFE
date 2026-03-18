/**
 * Inventory Item Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Inventory, không phụ thuộc framework
 */

import { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

export type ItemCategory = 'FOOD'
  | 'WATER'
  | 'MEDICAL'
  | 'CLOTHING'
  | 'EQUIPMENT'
  | 'OTHER';

export type ItemStatus = 'SUBMITTED'
  | 'CLOSED'
  | 'CANCELLED';

export type InventoryStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'RESERVED';

export interface InventoryItem {
  id: string;
  itemType: 'SUPPLY' | 'VEHICLE';
  // reference to supply, populated on backend
  supplyID: {
    _id: string;
    name?: string;
    category?: ItemCategory;
    unit?: string;
    unitWeight?: number;
    description?: string;
    isActive?: boolean;
    createdBy?: string; // user id
    _status?: InventoryStatus;
    source?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } | string;
  description?: string;
  quantity: number;
  reservedQuantity: number;
  unit?: string;
  // warehouse reference populated
  warehouse: Warehouse | string;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'RESERVED';
  lastUpdated: Date;
}

export interface UpdateInventoryData {
  quantity?: number;
  reservedQuantity?: number;
  description?: string;
  unit?: string;
  warehouse?: string;
  status?: 'ACTIVE' | 'OUT_OF_STOCK' | 'RESERVED';
}

export interface CreateInventoryItemData {
  supplyID: string;
  description?: string;
  quantity: number;
  reservedQuantity?: number;
  unit?: string;
  warehouse: string;
  status?: 'ACTIVE' | 'OUT_OF_STOCK' | 'RESERVED';
}
