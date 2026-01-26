/**
 * Resource Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Resource, không phụ thuộc framework
 */

export type ResourceType = 'vehicle' | 'equipment' | 'personnel' | 'facility';

export type ResourceStatus = 'available' | 'in_use' | 'maintenance' | 'unavailable';

export interface Resource {
    id: string;
    name: string;
    type: ResourceType;
    status: ResourceStatus;
    description?: string;
    location?: string;
    assignedTeamId?: string;
    capacity?: number;
    lastUsed?: Date;
}

export interface CreateResourceData {
    name: string;
    type: ResourceType;
    description?: string;
    location?: string;
    capacity?: number;
}

export interface UpdateResourceData {
    status?: ResourceStatus;
    location?: string;
    assignedTeamId?: string;
}
