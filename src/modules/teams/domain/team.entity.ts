/**
 * Team Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Team theo ERD v2.2
 */

// ─── Enums ───────────────────────────────────────────────

export type TeamStatus = "AVAILABLE" | "BUSY";

// ─── Team Member (populated user) ───────────────────────

export interface TeamMember {
  _id: string;
  userName: string;
  displayName?: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

// ─── Main Team Entity ────────────────────────────────────

export interface Team {
  _id: string;
  name: string;
  leaderId?: string | null;
  status: TeamStatus;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated ───────────────────────────────────────────

export interface PaginatedTeams {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Filter ──────────────────────────────────────────────

export interface GetTeamsFilter {
  status?: TeamStatus;
  page?: number;
  limit?: number;
}

// ─── Input DTOs ──────────────────────────────────────────

export interface CreateTeamInput {
  name: string;
  leaderId?: string;
}

export interface UpdateTeamInput {
  name?: string;
}

export interface ChangeLeaderInput {
  leaderId: string;
}

export interface AddMemberInput {
  userId: string;
}
