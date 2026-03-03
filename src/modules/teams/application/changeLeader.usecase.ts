import type { ITeamRepository } from "../domain/team.repository";
import type { Team, ChangeLeaderInput } from "../domain/team.entity";

/**
 * Use Case: Change Team Leader
 * Đổi leader của đội (chỉ khi team AVAILABLE).
 */
export class ChangeLeaderUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string, input: ChangeLeaderInput): Promise<Team> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    if (!input?.leaderId) {
      throw new Error("Leader ID is required");
    }
    return this.teamRepository.changeLeader(teamId, input);
  }
}

