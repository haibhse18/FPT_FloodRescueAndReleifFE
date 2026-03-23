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
  /** Mission ID - Backend may populate this as full Mission object instead of just the ID string */
  missionId: string;
  teamId: string;
  status: TimelineStatus;
  assignedAt: string;
  startedAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
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
  teamId?: string;
  status?: TimelineStatus;
  page?: number;
  limit?: number;
}

// ─── Input DTOs ──────────────────────────────────────────

export interface TimelineCancelInput {
  note?: string;
}

// Legacy interfaces - kept for backward compatibility but not used in new API
export interface TimelineCompletionSupplyInput {
  supplyId: string;
  quantityDelivered: number;
}

export interface TimelineCompletionItemInput {
  missionRequestId: string;
  rescuedCount: number;
  suppliesDelivered?: TimelineCompletionSupplyInput[];
}

// New unified API - outcome is auto-calculated by backend
export interface TimelineCompleteInput {
  note?: string;
}

export interface TimelineFailInput {
  failureReason: string;
  note?: string;
}

export interface TimelineWithdrawInput {
  withdrawalReason: string;
  note?: string;
}
