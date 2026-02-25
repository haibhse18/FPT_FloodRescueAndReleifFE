import { IMissionRepository } from "../domain/mission.repository";
import { PaginatedMissions, GetMissionsFilter } from "../domain/mission.entity";

/**
 * Use Case: Get Missions List
 */
export class GetMissionsUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(filters?: GetMissionsFilter): Promise<PaginatedMissions> {
    return await this.missionRepository.getMissions(filters);
  }
}
