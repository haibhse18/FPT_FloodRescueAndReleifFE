/**
 * Mission Repository Interface - Domain layer
 * Định nghĩa contract cho mission operations
 */

import {
  Mission,
  PaginatedMissions,
  GetMissionsFilter,
  CreateMissionInput,
  UpdateMissionInput,
  AssignTeamInput,
  RescueTeam,
} from "./mission.entity";

import { Timeline } from "@/modules/timelines/domain/timeline.entity";

export interface IMissionRepository {
  // ─── CRUD ────────────────────────────────────────────────
  createMission(input: CreateMissionInput): Promise<Mission>;
  getMissions(filters?: GetMissionsFilter): Promise<PaginatedMissions>;
  getMissionDetail(missionId: string): Promise<Mission>;
  updateMission(missionId: string, input: UpdateMissionInput): Promise<Mission>;
  deleteMission(missionId: string): Promise<void>;

  // ─── Assignment ──────────────────────────────────────────
  assignTeam(missionId: string, input: AssignTeamInput): Promise<Timeline>;

  // ─── Status Control ──────────────────────────────────────
  pauseMission(missionId: string): Promise<Mission>;
  resumeMission(missionId: string): Promise<Mission>;
  abortMission(missionId: string): Promise<Mission>;

  // ─── Teams ───────────────────────────────────────────────
  getTeams(params?: { status?: string }): Promise<RescueTeam[]>;
}
