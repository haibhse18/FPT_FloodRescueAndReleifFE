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

/** Team accepts → EN_ROUTE (Swagger: PATCH /timelines/{id}/accept, no body) */
export type TimelineAcceptInput = void;

/** Team arrives → ON_SITE (Swagger: PATCH /timelines/{id}/arrive, no body) */
export type TimelineArriveInput = void;

/** Team completes with outcome (Swagger: TimelineCompleteInput) */
export interface TimelineCompleteInput {
  outcome: "COMPLETED" | "PARTIAL";
  note?: string | null;
  rescuedCount?: number;
}

/** Team marks failed (Swagger: TimelineFailInput) */
export interface TimelineFailInput {
  failureReason: string;
  note?: string | null;
}

/** Team withdraws (Swagger: TimelineWithdrawInput) */
export interface TimelineWithdrawInput {
  withdrawalReason: string;
  note?: string | null;
}
