/**
 * Team Repository Implementation - Infrastructure layer
 * Follows the same response handling pattern as mission.repository.impl.ts
 */

import { ITeamRepository } from "../domain/team.repository";
import type {
  Team,
  PaginatedTeams,
  GetTeamsFilter,
  CreateTeamInput,
  UpdateTeamInput,
  ChangeLeaderInput,
  AddMemberInput,
  TeamMember,
} from "../domain/team.entity";
import { teamsApi } from "./team.api";

export class TeamRepositoryImpl implements ITeamRepository {
  // ── Applications ────────────────────────────────────────
  
  async getAllTeamApplications(params?: any): Promise<any> {
    const response = await teamsApi.getAllTeamApplications(params);
    const result = response as any;
    return {
      data: result.data ?? [],
      total: result.meta?.total ?? result.total ?? 0,
      page: result.meta?.page ?? result.page ?? 1,
      limit: result.meta?.limit ?? result.limit ?? 10,
      totalPages: result.meta?.totalPages ?? result.totalPages ?? 1,
    };
  }

  // ── CRUD ────────────────────────────────────────────────

  async getTeams(filter?: GetTeamsFilter): Promise<PaginatedTeams> {
    const response = await teamsApi.getTeams(filter);
    // Backend returns { success, data: [...], meta: { total, page, limit, totalPages } }
    const result = response as any;
    return {
      data: result.data ?? [],
      total: result.meta?.total ?? result.total ?? 0,
      page: result.meta?.page ?? result.page ?? 1,
      limit: result.meta?.limit ?? result.limit ?? 10,
      totalPages: result.meta?.totalPages ?? result.totalPages ?? 1,
    };
  }

  async getTeamById(teamId: string): Promise<Team> {
    const response = await teamsApi.getTeamById(teamId);
    // Backend returns { success, data: { ... } }
    return (response as any).data ?? response;
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const response = await teamsApi.createTeam(input);
    return (response as any).data ?? response;
  }

  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const response = await teamsApi.updateTeam(teamId, input);
    return (response as any).data ?? response;
  }

  async deleteTeam(teamId: string): Promise<void> {
    await teamsApi.deleteTeam(teamId);
  }

  // ── Leader ──────────────────────────────────────────────

  async changeLeader(teamId: string, input: ChangeLeaderInput): Promise<Team> {
    // Map from our DTO to swagger field name
    const response = await teamsApi.changeLeader(teamId, {
      newLeaderId: input.leaderId,
    });
    return (response as any).data ?? response;
  }

  // ── Members ─────────────────────────────────────────────

  async addMember(teamId: string, input: AddMemberInput): Promise<Team> {
    const response = await teamsApi.addMember(teamId, input);
    return (response as any).data ?? response;
  }

  async removeMember(teamId: string, userId: string): Promise<Team> {
    const response = await teamsApi.removeMember(teamId, userId);
    return (response as any).data ?? response;
  }

  // ── Available users ─────────────────────────────────────

  async getAvailableMembers(): Promise<TeamMember[]> {
    const response = await teamsApi.getAvailableMembers();
    const result = response as any;
    // Could be { data: [...] } or direct array
    return result.data || result || [];
  }

  //-Approve/Reject volunteer by Admin
  async approve(applicationId: string): Promise<Team> {
    const response = await teamsApi.approve(applicationId);
    return (response as any).data ?? response;
  }

  async reject(applicationId: string, reason: string): Promise<Team> {
    const response = await teamsApi.reject(applicationId, reason);
    return (response as any).data ?? response;
  }
}

// Singleton instance
export const teamRepository = new TeamRepositoryImpl();
