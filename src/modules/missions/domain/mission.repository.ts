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
  RescueTeam,
} from "./mission.entity";
import { MissionRequest } from "./missionRequest.entity";

import { Timeline } from "@/modules/timelines/domain/timeline.entity";

export interface IMissionRepository {
  // ─── CRUD ────────────────────────────────────────────────
  createMission(input: CreateMissionInput): Promise<Mission>;
  getMissions(filters?: GetMissionsFilter): Promise<PaginatedMissions>;
  getMissionDetail(missionId: string): Promise<Mission>;
  updateMission(missionId: string, input: UpdateMissionInput): Promise<Mission>;
  deleteMission(missionId: string): Promise<void>;

  // ─── Planning & Fulfillment ──────────────────────────────
  getMissionRequests(missionId: string): Promise<MissionRequest[]>;
  addRequests(missionId: string, input: { requestIds: string[]; note?: string }): Promise<void>;
  removeRequest(missionId: string, missionRequestId: string): Promise<void>;
  removeTeam(missionId: string, teamId: string): Promise<void>;
  addTeams(missionId: string, input: { teamIds: string[]; note?: string }): Promise<Timeline[]>;
  startMission(missionId: string): Promise<Mission>;
  updateMissionRequestProgress(missionRequestId: string, payload: { peopleRescuedIncrement?: number; suppliesDelivered?: { name: string; deliveredQty: number }[] }): Promise<void>;

  // ─── Status Control ──────────────────────────────────────
  pauseMission(missionId: string): Promise<Mission>;
  resumeMission(missionId: string): Promise<Mission>;
  abortMission(missionId: string): Promise<Mission>;

  // ─── Teams ───────────────────────────────────────────────
  getTeams(params?: { status?: string }): Promise<RescueTeam[]>;
}
