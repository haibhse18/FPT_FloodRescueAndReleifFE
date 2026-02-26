import { IMissionRepository } from "../domain/mission.repository";
import { Mission } from "../domain/mission.entity";

/**
 * Use Case: Resume Mission (PAUSED → IN_PROGRESS)
 */
export class ResumeMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string): Promise<Mission> {
    if (!missionId) throw new Error("Mission ID is required");
    return await this.missionRepository.resumeMission(missionId);
  }
}
