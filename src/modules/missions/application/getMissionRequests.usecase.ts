import { IMissionRepository } from "../domain/mission.repository";
import { MissionRequest } from "../domain/missionRequest.entity";

export class GetMissionRequestsUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string): Promise<MissionRequest[]> {
    return this.missionRepository.getMissionRequests(missionId);
  }
}
