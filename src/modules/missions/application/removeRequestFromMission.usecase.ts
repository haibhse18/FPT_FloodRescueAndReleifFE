import { IMissionRepository } from "../domain/mission.repository";

export class RemoveRequestFromMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string, missionRequestId: string): Promise<void> {
    return this.missionRepository.removeRequest(missionId, missionRequestId);
  }
}
