/**
 * Team Repository Interface - Domain layer
 * Định nghĩa contract cho team CRUD + member management
 */

import type {
  Team,
  PaginatedTeams,
  GetTeamsFilter,
  CreateTeamInput,
  UpdateTeamInput,
  ChangeLeaderInput,
  AddMemberInput,
  TeamMember,
} from "./team.entity";

export interface ITeamRepository {
  // ── CRUD ────────────────────────────────────────────────
  getTeams(filter?: GetTeamsFilter): Promise<PaginatedTeams>;
  getTeamById(teamId: string): Promise<Team>;
  createTeam(input: CreateTeamInput): Promise<Team>;
  updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team>;
  deleteTeam(teamId: string): Promise<void>;

  // ── Leader ──────────────────────────────────────────────
  changeLeader(teamId: string, input: ChangeLeaderInput): Promise<Team>;

  // ── Members ─────────────────────────────────────────────
  addMember(teamId: string, input: AddMemberInput): Promise<Team>;
  removeMember(teamId: string, userId: string): Promise<Team>;

  // ── Available users ─────────────────────────────────────
  getAvailableMembers(): Promise<TeamMember[]>;
}
