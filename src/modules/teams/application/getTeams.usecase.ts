import type { ITeamRepository } from "../domain/team.repository";
import type { PaginatedTeams, GetTeamsFilter } from "../domain/team.entity";

/**
 * Use Case: Get Teams (Coordinator dashboard)
 * Trả về danh sách đội có phân trang + filter theo status.
 */
export class GetTeamsUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(filter?: GetTeamsFilter): Promise<PaginatedTeams> {
    return this.teamRepository.getTeams(filter);
  }
}

