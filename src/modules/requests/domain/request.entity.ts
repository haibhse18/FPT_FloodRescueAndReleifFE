/**
 * Request Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Request theo Unified v2.2
 */

// ─── Enums ───────────────────────────────────────────────

export type RequestStatus =
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "PARTIALLY_FULFILLED"
  | "CLOSED"
  | "CANCELLED";
  // Note: FULFILLED status has been removed - backend auto-converts to CLOSED

export type PriorityLevel = "Critical" | "High" | "Normal";

export type RequestType = "Rescue" | "Relief";

export type IncidentType =
  | "Flood"
  | "Trapped"
  | "Injured"
  | "Landslide"
  | "Other";

export type RequestSource = "CITIZEN" | "COORDINATOR";

// ─── Legacy types (kept for backward compat) ────────────

/** @deprecated Use PriorityLevel instead */
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

/** @deprecated Use IncidentType instead */
export type DangerType = "flood" | "trapped" | "injury" | "landslide" | "other";

// ─── GeoPoint ────────────────────────────────────────────

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

// ─── Media ───────────────────────────────────────────────

export interface RequestMedia {
  imageUrl: string;
  description?: string;
  uploadedAt?: string;
}

// ─── Supply Item ─────────────────────────────────────────

export interface RequestSupplyItem {
  supplyId: string;
  requestedQty: number;
  supplyName?: string;
}

// ─── Main Request Entity ─────────────────────────────────

export interface CoordinatorRequest {
  _id: string;
  userName?: string;
  userId?: string | null;
  createdBy?: string;
  source?: RequestSource;
  phoneNumber?: string | null;
  type: RequestType | string;
  incidentType?: IncidentType | string;
  location?: GeoPoint;
  description: string;
  peopleCount?: number;
  priority: PriorityLevel | string;
  status: RequestStatus | string;
  requestSupplies?: RequestSupplyItem[];
  media?: RequestMedia[];
  imageUrls?: string[];
  isDuplicated?: boolean;
  duplicatedOfRequestId?: string | null;
  isLocationVerified?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;

  // Legacy fields for backward compat
  requestId?: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  missionId?: string;
}

// ─── Pagination ──────────────────────────────────────────

export interface PaginatedRequests {
  data: CoordinatorRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Filter ──────────────────────────────────────────────

export interface GetRequestsFilter {
  status?: string;
  type?: string;
  incidentType?: string;
  priority?: string;
  source?: string;
  userName?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

// ─── Input DTOs ──────────────────────────────────────────

export interface VerifyRequestInput {
  approved: boolean;
  priority?: PriorityLevel;
  reason?: string;
}

export interface MarkDuplicateInput {
  duplicatedOfRequestId: string;
}

export interface UpdateLocationInput {
  location: GeoPoint;
  isLocationVerified?: boolean;
}

export interface UpdatePriorityInput {
  priority: PriorityLevel;
}

export interface CancelRequestInput {
  reason?: string;
}

export interface CreateOnBehalfInput {
  citizenId?: string;
  userName?: string;
  phoneNumber?: string;
  type: RequestType;
  incidentType?: IncidentType;
  location: GeoPoint;
  description: string;
  peopleCount?: number;
  priority?: PriorityLevel;
  requestSupplies?: RequestSupplyItem[];
  imageUrls?: string[];
}

// ─── Legacy types (kept for existing citizen pages) ──────

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
  status: string;
  assignedTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRescueRequestData {
  type?: string;
  incidentType?: string;
  latitude?: number;
  longitude?: number;
  description: string;
  imageUrls?: string[];
  priority?: string;
  peopleCount?: number;
  requestSupply?: unknown[];
  requestSupplies?: { supplyId: string; requestedQty: number }[];
  location?: string | { type?: string; coordinates: [number, number] };
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

// ─── Search Citizens ─────────────────────────────────────

export interface CitizenSearchResult {
  _id: string;
  userName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
}
