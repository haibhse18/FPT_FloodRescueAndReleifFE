import { IMissionRepository } from "../domain/mission.repository";
import { Mission } from "../domain/mission.entity";

/**
 * Use Case: Abort Mission (→ ABORTED, auto-cancel active timelines)
 */
export class AbortMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string): Promise<Mission> {
    if (!missionId) throw new Error("Mission ID is required");
    return await this.missionRepository.abortMission(missionId);
  }
}
