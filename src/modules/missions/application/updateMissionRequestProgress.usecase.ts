import { IMissionRepository } from "../domain/mission.repository";

export class UpdateMissionRequestProgressUseCase {
  constructor(private readonly missionRepository: IMissionRepository) {}

  async execute(
    missionRequestId: string,
    payload: {
      peopleRescuedIncrement?: number;
      suppliesDelivered?: { supplyId: string; quantityDelivered: number }[];
    },
  ): Promise<void> {
    if (!missionRequestId) {
      throw new Error("missionRequestId is required");
    }
    return this.missionRepository.updateMissionRequestProgress(missionRequestId, payload);
  }
}
