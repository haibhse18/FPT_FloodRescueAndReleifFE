/**
 * Team Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Team, không phụ thuộc framework
 */

export type TeamStatus = 'available' | 'busy' | 'offline';

export type RequestStatus = 'in_progress' | 'completed' | 'failed';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    phone?: string;
}

export interface Team {
    id: string;
    name: string;
    status: TeamStatus;
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    members: TeamMember[];
}

export interface AssignedRequest {
    id: string;
    type: string;
    location: string;
    latitude: number;
    longitude: number;
    description: string;
    urgencyLevel: string;
    status: string;
    assignedAt: Date;
}

export interface UpdateRequestStatusData {
    status: RequestStatus;
    note?: string;
}

export interface LocationData {
    lat: number;
    lng: number;
}
