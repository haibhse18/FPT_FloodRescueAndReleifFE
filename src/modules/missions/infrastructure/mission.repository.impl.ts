/**
 * Mission Repository Implementation - Infrastructure layer
 * Implement IMissionRepository using missionApi
 */

import { IMissionRepository } from "../domain/mission.repository";
import {
  Mission,
  PaginatedMissions,
  GetMissionsFilter,
  CreateMissionInput,
  UpdateMissionInput,
  RescueTeam,
} from "../domain/mission.entity";
import { MissionRequest } from "../domain/missionRequest.entity";
import { Timeline } from "@/modules/timelines/domain/timeline.entity";
import { missionApi } from "./mission.api";

export class MissionRepositoryImpl implements IMissionRepository {
  // ─── CRUD ────────────────────────────────────────────────

  async createMission(input: CreateMissionInput): Promise<Mission> {
    const response = await missionApi.createMission(input);
    return ((response as any).data ?? response) as Mission;
  }

  async getMissions(filters?: GetMissionsFilter): Promise<PaginatedMissions> {
    const response = await missionApi.getMissions(filters);
    // Backend may return { data: [...], meta: {...} }
    const result = response as any;
    return {
      data: result.data ?? [],
      total: result.meta?.total ?? 0,
      page: result.meta?.page ?? 1,
      limit: result.meta?.limit ?? 10,
      totalPages: result.meta?.totalPages ?? 1,
    };
  }

  async getMissionDetail(missionId: string): Promise<Mission> {
    const response = await missionApi.getMissionDetail(missionId);
    return ((response as any).data ?? response) as Mission;
  }

  async updateMission(
    missionId: string,
    input: UpdateMissionInput,
  ): Promise<Mission> {
    const response = await missionApi.updateMission(missionId, input);
    return ((response as any).data ?? response) as Mission;
  }

  async deleteMission(missionId: string): Promise<void> {
    await missionApi.deleteMission(missionId);
  }

  // ─── Planning & Fulfillment ──────────────────────────────

  async getMissionRequests(missionId: string): Promise<MissionRequest[]> {
    const response = await missionApi.getMissionRequests(missionId);
    return ((response as any).data ?? []) as MissionRequest[];
  }

  async addRequests(
    missionId: string,
    input: { requestIds: string[]; note?: string },
  ): Promise<void> {
    await missionApi.addRequests(missionId, input);
  }

  async removeRequest(
    missionId: string,
    missionRequestId: string,
  ): Promise<void> {
    await missionApi.removeRequest(missionId, missionRequestId);
  }

  async removeTeam(missionId: string, teamId: string): Promise<void> {
    await missionApi.removeTeam(missionId, teamId);
  }

  async addTeams(
    missionId: string,
    input: { teamIds: string[]; note?: string },
  ): Promise<Timeline[]> {
    const response = await missionApi.addTeams(missionId, input);
    return ((response as any).data ?? []) as Timeline[];
  }

  async startMission(missionId: string): Promise<Mission> {
    const response = await missionApi.startMission(missionId);
    return ((response as any).data ?? response) as Mission;
  }

  async updateMissionRequestProgress(
    missionRequestId: string,
    payload: {
      peopleRescuedIncrement?: number;
      suppliesDelivered?: { name: string; deliveredQty: number }[];
    },
  ): Promise<void> {
    await missionApi.updateMissionRequestProgress(missionRequestId, payload);
  }

  // ─── Status Control ──────────────────────────────────────

  async pauseMission(missionId: string): Promise<Mission> {
    const response = await missionApi.pauseMission(missionId);
    return ((response as any).data ?? response) as Mission;
  }

  async resumeMission(missionId: string): Promise<Mission> {
    const response = await missionApi.resumeMission(missionId);
    return ((response as any).data ?? response) as Mission;
  }

  async abortMission(missionId: string): Promise<Mission> {
    const response = await missionApi.abortMission(missionId);
    return ((response as any).data ?? response) as Mission;
  }

  // ─── Teams ───────────────────────────────────────────────

  async getTeams(params?: { status?: string }): Promise<RescueTeam[]> {
    const response = await missionApi.getTeams(params);
    return ((response as any).data ?? []) as RescueTeam[];
  }
}

// Singleton instance
export const missionRepository = new MissionRepositoryImpl();
