import { IMissionRepository } from "../domain/mission.repository";

export class AddRequestsToMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(
    missionId: string,
    input: { requestIds: string[]; note?: string }
  ): Promise<void> {
    return this.missionRepository.addRequests(missionId, input);
  }
}
