import type { ITeamRepository } from "../domain/team.repository";
import type { CreateTeamInput, Team } from "../domain/team.entity";

/**
 * Use Case: Create Team
 * Coordinator tạo đội cứu hộ mới.
 */
export class CreateTeamUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(input: CreateTeamInput): Promise<Team> {
    if (!input?.name?.trim()) {
      throw new Error("Team name is required");
    }
    return this.teamRepository.createTeam({
      ...input,
      name: input.name.trim(),
    });
  }
}

