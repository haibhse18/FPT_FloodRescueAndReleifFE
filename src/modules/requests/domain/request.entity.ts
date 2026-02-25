/**
 * Request Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Request, không phụ thuộc framework
 */

// Actual backend status enum (UPPERCASE) per swagger
export type RequestStatus =
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED"
  | "CLOSED"
  | "CANCELLED";

// Actual backend priority enum (Title Case) per swagger
export type UrgencyLevel = "Critical" | "High" | "Normal";

export type DangerType = "Flood" | "Trapped" | "Injured" | "Landslide" | "Other";

export interface RescueRequest {
  _id?: string;
  id?: string;
  requestId?: string;
  userId?: string;
  userName?: string;
  type: string;
  incidentType?: string;
  location: { type: "Point"; coordinates: [number, number] } | string;
  latitude?: number;
  longitude?: number;
  description: string;
  imageUrls?: string[];
  media?: Array<{ imageUrl: string; description?: string; uploadedAt?: string }>;
  priority?: UrgencyLevel;
  peopleCount?: number;
  status: RequestStatus | string;
  source?: "CITIZEN" | "COORDINATOR";
  createdBy?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  missionId?: string;
  isDuplicated?: boolean;
  isLocationVerified?: boolean;
  requestSupplies?: Array<{ supplyId: string; requestedQty: number }>;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateRescueRequestData {
  type: "Rescue" | "Relief";
  incidentType?: "Flood" | "Trapped" | "Injured" | "Landslide" | "Other";
  location: { type: "Point"; coordinates: [number, number] };
  description: string;
  imageUrls?: string[];
  peopleCount?: number;
  requestSupplies?: Array<{ supplyId: string; requestedQty: number }>;
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
  userName?: string;
}

export interface CoordinatorRequest {
  requestId?: string;
  _id?: string;
  id?: string;
  userId?: string;
  userName?: string;
  displayName?: string;
  source?: "CITIZEN" | "COORDINATOR";
  type: string;
  incidentType?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  latitude?: number;
  longitude?: number;
  address?: string;
  description: string;
  peopleCount?: number;
  priority?: "Critical" | "High" | "Normal";
  status: RequestStatus | string;
  imageUrls?: string[];
  media?: Array<{ imageUrl: string; description?: string; uploadedAt?: string }>;
  requestSupplies?: Array<{ supplyId: string; requestedQty: number }>;
  isDuplicated?: boolean;
  isLocationVerified?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  assignedTeamId?: string;
  assignedTeamName?: string;
  missionId?: string;
}

export interface PaginatedRequests {
  data: CoordinatorRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedRescueRequests {
  data: RescueRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
