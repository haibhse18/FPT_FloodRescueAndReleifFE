/**
 * Get Team Requests Use Case
 */

import type { TeamRequestRepository } from "../infrastructure/teamRequest.repository.impl";
import type { GetTeamRequestsFilter, PaginatedTeamRequests } from "../domain/teamRequest.entity";

export class GetTeamRequestsUseCase {
  constructor(private repository: TeamRequestRepository) {}

  async execute(filters: GetTeamRequestsFilter): Promise<PaginatedTeamRequests> {
    return await this.repository.getTeamRequests(filters);
  }
}
