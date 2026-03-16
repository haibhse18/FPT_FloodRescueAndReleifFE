import { IMissionRepository } from "../domain/mission.repository";
import { Mission } from "../domain/mission.entity";

export class StartMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string): Promise<Mission> {
    return this.missionRepository.startMission(missionId);
  }
}
