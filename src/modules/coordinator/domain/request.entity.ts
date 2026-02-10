/**
 * Request Entity for Coordinator
 * Tương tự RescueRequest nhưng có thể có thêm fields cho coordinator
 */
export interface CoordinatorRequest {
  requestId: string;
  userId: string;
  userName?: string;
  displayName?: string;
  type: "Rescue" | "Relief";
  incidentType?: string;
  latitude: number;
  longitude: number;
  address?: string;
  description: string;
  peopleCount?: number;
  priority: "critical" | "high" | "normal";
  status: "Submitted" | "Verified" | "In Progress" | "Completed" | "Spam" | "Rejected" | "Cancelled";
  imageUrls?: string[];
  requestSupply?: Array<{
    supplyId: string;
    supplyName?: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  missionId?: string;
}

/**
 * Mission Entity
 */
export interface Mission {
  missionId: string;
  teamId: string;
  teamName?: string;
  requestIds: string[];
  requests?: CoordinatorRequest[];
  vehicleId?: string;
  vehicleName?: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

/**
 * Team Position
 */
export interface TeamPosition {
  positionId: string;
  missionId: string;
  teamId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

/**
 * Request filters for coordinator
 */
export interface RequestFilters {
  status?: string;
  type?: string;
  incidentType?: string;
  priority?: string;
  userName?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedRequests {
  data: CoordinatorRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
