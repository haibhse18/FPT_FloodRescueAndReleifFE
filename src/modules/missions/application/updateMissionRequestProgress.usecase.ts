import { IMissionRepository } from "../domain/mission.repository";

export class UpdateMissionRequestProgressUseCase {
  constructor(private readonly missionRepository: IMissionRepository) {}

  async execute(
    missionRequestId: string,
    payload: {
      peopleRescuedIncrement?: number;
      suppliesDelivered?: { name: string; deliveredQty: number }[];
    },
  ): Promise<void> {
    if (!missionRequestId) {
      throw new Error("missionRequestId is required");
    }
    return this.missionRepository.updateMissionRequestProgress(missionRequestId, payload);
  }
}
