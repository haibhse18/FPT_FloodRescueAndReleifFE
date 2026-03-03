import type { ITeamRepository } from "../domain/team.repository";
import type { Team, UpdateTeamInput } from "../domain/team.entity";

/**
 * Use Case: Update Team
 * Đổi tên / thông tin đội.
 */
export class UpdateTeamUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string, input: UpdateTeamInput): Promise<Team> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    if (!input || !input.name?.trim()) {
      throw new Error("Nothing to update");
    }
    return this.teamRepository.updateTeam(teamId, {
      ...input,
      name: input.name?.trim(),
    });
  }
}

