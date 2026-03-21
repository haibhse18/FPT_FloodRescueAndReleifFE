/**
 * Complete Team Request Use Case
 */

import type { TeamRequestRepository } from "../infrastructure/teamRequest.repository.impl";
import type { CompleteTeamRequestInput, TeamRequest } from "../domain/teamRequest.entity";

export class CompleteTeamRequestUseCase {
  constructor(private repository: TeamRequestRepository) {}

  async execute(teamRequestId: string, input: CompleteTeamRequestInput): Promise<TeamRequest> {
    return await this.repository.completeTeamRequest(teamRequestId, input);
  }
}
