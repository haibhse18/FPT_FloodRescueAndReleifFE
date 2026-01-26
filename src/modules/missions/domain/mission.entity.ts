/**
 * Mission Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Mission, không phụ thuộc framework
 */

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type MissionStatus = 
    | 'pending' 
    | 'assigned' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled';

export interface Mission {
    id: string;
    requestId: string;
    teamId: string;
    priority: PriorityLevel;
    status: MissionStatus;
    assignedAt: Date;
    completedAt?: Date;
    notes?: string;
}

export interface RescueTeam {
    id: string;
    name: string;
    status: 'available' | 'busy' | 'offline';
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    memberCount: number;
}

export interface CoordinatorRequest {
    id: string;
    type: string;
    location: string;
    latitude: number;
    longitude: number;
    description: string;
    urgencyLevel: string;
    status: string;
    assignedTeam?: RescueTeam;
    createdAt: Date;
}

export interface GetAllRequestsFilter {
    status?: string;
    urgency?: string;
    dateFrom?: string;
    dateTo?: string;
}
