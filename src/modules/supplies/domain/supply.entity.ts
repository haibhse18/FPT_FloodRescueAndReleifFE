/**
 * Supply Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Supply, không phụ thuộc framework
 */

export type SupplyCategory = 'food' | 'water' | 'medicine' | 'shelter' | 'clothing' | 'hygiene' | 'other';

export type SupplyStatus = 'pending' | 'approved' | 'dispatched' | 'delivered';

export interface Supply {
    id: string;
    name: string;
    category: SupplyCategory;
    quantity: number;
    unit: string;
    requestId?: string;
    status: SupplyStatus;
    source?: string;
    destination?: string;
    estimatedDelivery?: Date;
    createdAt: Date;
}

export interface SupplyRequest {
    id: string;
    requestId: string;
    items: SupplyItem[];
    status: SupplyStatus;
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
