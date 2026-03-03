import type { ITeamRepository } from "../domain/team.repository";
import type { TeamMember } from "../domain/team.entity";

/**
 * Use Case: Get Available Members
 * Lấy danh sách user đủ điều kiện để thêm vào đội.
 */
export class GetAvailableMembersUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(): Promise<TeamMember[]> {
    return this.teamRepository.getAvailableMembers();
  }
}

