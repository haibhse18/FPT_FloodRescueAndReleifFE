import type { ITeamRepository } from "../domain/team.repository";

/**
 * Use Case: Delete Team
 * Xoá đội khi không còn thành viên và không tham gia nhiệm vụ.
 */
export class DeleteTeamUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string): Promise<void> {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    await this.teamRepository.deleteTeam(teamId);
  }
}

