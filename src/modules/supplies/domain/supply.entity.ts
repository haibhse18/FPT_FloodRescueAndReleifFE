/**
 * Supply Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Supply, không phụ thuộc framework
 */

// categories should match backend enum values (uppercase)
export type SupplyCategory =
  | 'FOOD'
  | 'WATER'
  | 'MEDICAL'
  | 'CLOTHING'
  | 'EQUIPMENT'
  | 'OTHER';

// statuses mirror backend SUPPLY_STATUS
export type SupplyStatus =
  | 'SUBMITTED'
  | 'CLOSED'
  | 'CANCELLED';
export type REQUEST_STATUS = 
  |'SUBMITTED'
  |  'REJECTED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  |'FULFILLED'
  | 'CLOSED'
  |  'CANCELLED';

  export type REQUEST_TYPE = "Rescue" | "Relief";
export interface Supply {
    id: string;
    name: string;
    category: SupplyCategory;
    unit: string;
    unitWeight: number;
    description: string;
    isActive: boolean;
    createdBy: string; // user id
    status: SupplyStatus;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SupplyRequest {
    id: string;
    requestId: string;
    type: REQUEST_TYPE;
    items: SupplyItem[];
    status: REQUEST_STATUS;
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
}

export interface SupplyItem {
    name: string;
    category: SupplyCategory;
    quantity: number;
    unit: string;
}

export interface CreateSupplyRequestData {
    requestId: string;
    items: SupplyItem[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
