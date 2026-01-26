/**
 * ==============================================
 * TYPES - TYPESCRIPT INTERFACES & TYPES
 * ==============================================
 */

// ==============================================
// USER & AUTH TYPES
// ==============================================

export type UserRole = 'admin' | 'manager' | 'coordinator' | 'rescue_team' | 'citizen';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// ==============================================
// RESCUE REQUEST TYPES
// ==============================================

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export interface Location {
    lat: number;
    lng: number;
}

export interface RescueRequest {
    id: string;
    citizenId: string;
    citizen: User;
    location: Location;
    address: string;
    description: string;
    urgencyLevel: UrgencyLevel;
    status: RequestStatus;
    peopleCount: number;
    hasInjuries: boolean;
    hasChildren: boolean;
    hasElderly: boolean;
    phone: string;
    assignedTeamId?: string;
    assignedTeam?: RescueTeam;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

// ==============================================
// RESCUE TEAM TYPES
// ==============================================

export type TeamStatus = 'available' | 'busy' | 'offline';

export interface RescueTeam {
    id: string;
    name: string;
    leaderId: string;
    leader: User;
    members: User[];
    status: TeamStatus;
    currentLocation?: Location;
    assignedRequests: RescueRequest[];
    createdAt: string;
    updatedAt: string;
}

// ==============================================
// NOTIFICATION TYPES
// ==============================================

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// ==============================================
// MAP TYPES
// ==============================================

export interface FloodZone {
    id: string;
    name: string;
    coordinates: Location[];
    riskLevel: 'low' | 'medium' | 'high';
    affectedArea: number; // km²
}

export interface SafeZone {
    id: string;
    name: string;
    location: Location;
    capacity: number;
    currentOccupancy: number;
    facilities: string[];
}

// ==============================================
// DASHBOARD & STATS TYPES
// ==============================================

export interface DashboardStats {
    totalRequests: number;
    pendingRequests: number;
    inProgressRequests: number;
    completedRequests: number;
    totalCitizens: number;
    totalRescueTeams: number;
    availableTeams: number;
    busyTeams: number;
}

export interface Report {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    date: string;
    stats: DashboardStats;
    generatedAt: string;
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
