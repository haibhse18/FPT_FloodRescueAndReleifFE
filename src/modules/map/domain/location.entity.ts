/**
 * Location Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Location, không phụ thuộc framework
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Address {
    display: string;
    city?: string;
    district?: string;
    street?: string;
    country?: string;
}

export interface Location {
    coordinates: Coordinates;
    address: Address;
}

export interface FloodZone {
    id: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    boundaries: Coordinates[];
    description?: string;
}

export interface SafeZone {
    id: string;
    name: string;
    type: 'shelter' | 'hospital' | 'evacuation_point';
    coordinates: Coordinates;
    capacity?: number;
    address?: string;
    phone?: string;
}
