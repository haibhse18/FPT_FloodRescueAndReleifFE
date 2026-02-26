/**
 * Timeline Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Timeline theo Unified v2.2
 */

// ─── Enums ───────────────────────────────────────────────

export type TimelineStatus =
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ON_SITE"
  | "COMPLETED"
  | "PARTIAL"
  | "FAILED"
  | "WITHDRAWN"
  | "CANCELLED";

// ─── Main Timeline Entity ────────────────────────────────

export interface Timeline {
  _id: string;
  missionId: string;
  requestId: string;
  teamId: string;
  status: TimelineStatus;
  assignedAt: string;
  startedAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
  rescuedCount?: number;
  failureReason?: string | null;
  withdrawalReason?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated ───────────────────────────────────────────

export interface PaginatedTimelines {
  data: Timeline[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Filter ──────────────────────────────────────────────

export interface GetTimelinesFilter {
  missionId?: string;
  requestId?: string;
  teamId?: string;
  status?: TimelineStatus;
  page?: number;
  limit?: number;
}

// ─── Input DTOs ──────────────────────────────────────────

export interface TimelineCancelInput {
  note?: string;
}
