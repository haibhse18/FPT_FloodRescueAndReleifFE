import { IMissionRepository } from "../domain/mission.repository";

/**
 * Use Case: Create Mission
 * Coordinator assign team to request(s)
 */
export class CreateMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(data: {
    teamId: string;
    requestIds: string[];
    vehicleId?: string;
  }): Promise<string> {
    if (!data.teamId) {
      throw new Error("Team ID is required");
    }

    if (!data.requestIds || data.requestIds.length === 0) {
      throw new Error("At least one request ID is required");
    }

    return await this.missionRepository.createMission(data);
  }
}
