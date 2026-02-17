/**
 * Mission Repository Implementation - Infrastructure layer
 * Implement IMissionRepository interface using coordinatorApi
 */

import { IMissionRepository } from "../domain/mission.repository";
import {
  CoordinatorRequest,
  RescueTeam,
  GetAllRequestsFilter,
  PriorityLevel,
} from "../domain/mission.entity";
import { missionApi } from "./mission.api";

export class MissionRepositoryImpl implements IMissionRepository {
  async getAllRequests(
    filters?: GetAllRequestsFilter,
  ): Promise<CoordinatorRequest[]> {
    const response = await missionApi.getAllRequests(filters);
    return (response as any).data || [];
  }

  async assignRescueTeam(requestId: string, teamId: string): Promise<void> {
    await missionApi.assignRescueTeam(requestId, teamId);
  }

  async getRescueTeams(): Promise<RescueTeam[]> {
    const response = await missionApi.getRescueTeams();
    return (response as any).data || [];
  }

  async updateRequestPriority(
    requestId: string,
    priority: PriorityLevel,
  ): Promise<void> {
    await missionApi.updateRequestPriority(requestId, priority);
  }

  async createMission(data: {
    teamId: string;
    requestIds: string[];
    vehicleId?: string;
  }): Promise<string> {
    const response = await missionApi.createMission(data);
    return (response as any).missionId;
  }

  async reassignMission(missionId: string, teamId: string): Promise<void> {
    await missionApi.reassignMission(missionId, teamId);
  }

  async getMissionPositions(missionId: string): Promise<any[]> {
    const response = await missionApi.getMissionPositions(missionId);
    return (response as any).data || response;
  }

  async getAllMissions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    const response = await missionApi.getAllMissions(params);
    return (response as any).data || response;
  }
}

// Singleton instance for easy access
export const missionRepository = new MissionRepositoryImpl();
