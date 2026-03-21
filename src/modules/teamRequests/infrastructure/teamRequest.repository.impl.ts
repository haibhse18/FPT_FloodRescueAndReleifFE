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
    const response = await teamRequestApi.getTeamRequests(filters);
    return {
      data: response.data?.data || [],
      total: response.data?.meta?.total || 0,
      page: response.data?.meta?.page || 1,
      limit: response.data?.meta?.limit || 10,
      totalPages: response.data?.meta?.totalPages || 1,
    };
  }

  async getTeamRequestDetail(teamRequestId: string): Promise<TeamRequest> {
    const response = await teamRequestApi.getTeamRequestDetail(teamRequestId);
    return response.data?.data;
  }

  async completeTeamRequest(
    teamRequestId: string,
    input: CompleteTeamRequestInput,
  ): Promise<TeamRequest> {
    const response = await teamRequestApi.completeTeamRequest(teamRequestId, input);
    return response.data?.data;
  }
}

export const teamRequestRepository = new TeamRequestRepositoryImpl();
