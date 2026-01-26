/**
 * Request Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Request, không phụ thuộc framework
 */

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RequestStatus = 
    | 'pending' 
    | 'assigned' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled';

export type DangerType = 
    | 'flood' 
    | 'trapped' 
    | 'injury' 
    | 'landslide' 
    | 'other';

export interface RescueRequest {
    id: string;
    userId: string;
    type: DangerType;
    latitude: number;
    longitude: number;
    location: string;
    description: string;
    imageUrls: string[];
    urgencyLevel: UrgencyLevel;
    numberOfPeople: number;
    status: RequestStatus;
    assignedTeamId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRescueRequestData {
    type?: string;
    latitude: number;
    longitude: number;
    description: string;
    imageUrls?: string[];
    priority?: string;
    peopleCount?: number;
    requestSupply?: unknown[];
    location?: string;
    dangerType?: string;
    numberOfPeople?: number;
    urgencyLevel?: string;
    images?: string[];
}

export interface EmergencyRequestData {
    location: { lat: number; lng: number };
    address: string;
    description: string;
    urgencyLevel: UrgencyLevel;
    peopleCount: number;
    hasInjuries: boolean;
    hasChildren: boolean;
    hasElderly: boolean;
    phone: string;
}

export interface GetRequestsFilter {
    status?: string;
    type?: string;
    incidentType?: string;
    priority?: string;
    page?: number;
    limit?: number;
}
