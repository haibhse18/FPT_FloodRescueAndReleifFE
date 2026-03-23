/**
 * TeamRequest Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu TeamRequest
 */

export type TeamRequestOutcome = "COMPLETED" | "PARTIAL";

export interface TeamRequest {
  _id: string;
  missionId: string;
  missionRequestId: string;
  teamId: string;
  
  // Progress tracking
  rescuedCountTotal: number;
  
  // Completion info
  outcome?: TeamRequestOutcome | null;
  completedAt?: string | null;
  completedBy?: string | null;
  note?: string | null;
  
  createdAt: string;
  updatedAt: string;
  lastUpdatedAt?: string;
}

export interface PaginatedTeamRequests {
  data: TeamRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTeamRequestsFilter {
  missionId?: string;
  missionRequestId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

export interface CompleteTeamRequestInput {
  note?: string;
}
