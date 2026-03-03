import type { ITeamRepository } from "../domain/team.repository";
import type { Team } from "../domain/team.entity";

/**
 * Use Case: Get Team Detail
 * Lấy chi tiết 1 đội bao gồm leader + members.
 */
export class GetTeamDetailUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string): Promise<Team> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    return this.teamRepository.getTeamById(teamId);
  }
}

