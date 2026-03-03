import type { ITeamRepository } from "../domain/team.repository";
import type { Team } from "../domain/team.entity";

/**
 * Use Case: Remove Member from Team
 * Xoá 1 thành viên khỏi đội.
 */
export class RemoveMemberUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string, userId: string): Promise<Team> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }
    return this.teamRepository.removeMember(teamId, userId);
  }
}

