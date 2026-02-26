/**
 * Mission Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Mission theo Unified v2.2
 */

// ─── Enums ───────────────────────────────────────────────

export type MissionStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "PARTIAL"
  | "COMPLETED"
  | "ABORTED";

export type MissionType = "RESCUE" | "RELIEF";

export type PriorityLevel = "Critical" | "High" | "Normal";

// ─── Main Mission Entity ─────────────────────────────────

export interface Mission {
  _id: string;
  code: string;
  name: string;
  description?: string | null;
  status: MissionStatus;
  priority: PriorityLevel;
  type: MissionType;
  coordinatorId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated ───────────────────────────────────────────

export interface PaginatedMissions {
  data: Mission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Filter ──────────────────────────────────────────────

export interface GetMissionsFilter {
  status?: MissionStatus;
  type?: MissionType;
  code?: string;
  page?: number;
  limit?: number;
}

// ─── Input DTOs ──────────────────────────────────────────

export interface CreateMissionInput {
  name: string;
  type: MissionType;
  description?: string;
  priority?: PriorityLevel;
}

export interface UpdateMissionInput {
  name?: string;
  description?: string;
  priority?: PriorityLevel;
}

export interface AssignTeamInput {
  teamId: string;
  requestId: string;
  note?: string;
}

// ─── Rescue Team (for assign modal) ─────────────────────

export interface RescueTeam {
  _id: string;
  name: string;
  status: "AVAILABLE" | "BUSY" | string;
  leaderId?: string;
  members?: Array<{
    _id: string;
    displayName?: string;
  }>;
}
