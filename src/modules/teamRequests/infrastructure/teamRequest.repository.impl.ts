/**
 * TeamRequest Repository Implementation
 */

import { teamRequestApi } from "./teamRequest.api";
import type {
  TeamRequest,
  PaginatedTeamRequests,
  GetTeamRequestsFilter,
  CompleteTeamRequestInput,
} from "../domain/teamRequest.entity";

export interface TeamRequestRepository {
  getTeamRequests(filters: GetTeamRequestsFilter): Promise<PaginatedTeamRequests>;
  getTeamRequestDetail(teamRequestId: string): Promise<TeamRequest>;
  completeTeamRequest(teamRequestId: string, input: CompleteTeamRequestInput): Promise<TeamRequest>;
}

class TeamRequestRepositoryImpl implements TeamRequestRepository {
  async getTeamRequests(filters: GetTeamRequestsFilter): Promise<PaginatedTeamRequests> {
    const response = await teamRequestApi.getTeamRequests(filters) as any;
    return {
      data: response.data || [],
      total: response.meta?.total || 0,
      page: response.meta?.page || 1,
      limit: response.meta?.limit || 10,
      totalPages: response.meta?.totalPages || 1,
    };
  }

  async getTeamRequestDetail(teamRequestId: string): Promise<TeamRequest> {
    const response = await teamRequestApi.getTeamRequestDetail(teamRequestId) as any;
    return response.data;
  }

  async completeTeamRequest(
    teamRequestId: string,
    input: CompleteTeamRequestInput,
  ): Promise<TeamRequest> {
    const response = await teamRequestApi.completeTeamRequest(teamRequestId, input) as any;
    return response.data;
  }
}

export const teamRequestRepository = new TeamRequestRepositoryImpl();
