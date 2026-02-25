import { IMissionRepository } from "../domain/mission.repository";
import { Mission } from "../domain/mission.entity";

/**
 * Use Case: Pause Mission (IN_PROGRESS → PAUSED)
 */
export class PauseMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string): Promise<Mission> {
    if (!missionId) throw new Error("Mission ID is required");
    return await this.missionRepository.pauseMission(missionId);
  }
}
