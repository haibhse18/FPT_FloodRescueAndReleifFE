import type { ITeamRepository } from "../domain/team.repository";
import type { Team, AddMemberInput } from "../domain/team.entity";

/**
 * Use Case: Add Member to Team
 * Thêm 1 user (Rescue Team, chưa có team) vào đội.
 */
export class AddMemberUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string, input: AddMemberInput): Promise<Team> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    if (!input?.userId) {
      throw new Error("User ID is required");
    }
    return this.teamRepository.addMember(teamId, input);
  }
}

