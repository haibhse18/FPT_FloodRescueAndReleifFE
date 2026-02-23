/**
 * Request Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Request, không phụ thuộc framework
 */

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type RequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DangerType = "flood" | "trapped" | "injury" | "landslide" | "other";

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
  incidentType?: string;
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
  userName?: string;
}

export interface CoordinatorRequest {
  requestId: string;
  userId: string;
  userName?: string;
  displayName?: string;
  type: DangerType | "Rescue" | "Relief";
  incidentType?: string;
  latitude: number;
  longitude: number;
  address?: string;
  description: string;
  peopleCount?: number;
  priority: UrgencyLevel | "critical" | "high" | "normal";
  status:
  | RequestStatus
  | "Submitted"
  | "Verified"
  | "In Progress"
  | "Completed"
  | "Spam"
  | "Rejected"
  | "Cancelled";
  imageUrls?: string[];
  requestSupply?: Array<{
    supplyId: string;
    supplyName?: string;
    quantity: number;
  }>;
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
