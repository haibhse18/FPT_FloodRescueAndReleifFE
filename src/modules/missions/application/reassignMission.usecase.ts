import { IMissionRepository } from "../domain/mission.repository";

/**
 * Use Case: Reassign Mission
 * Coordinator reassign mission to different team
 */
export class ReassignMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string, newTeamId: string): Promise<void> {
    if (!missionId) {
      throw new Error("Mission ID is required");
    }

    if (!newTeamId) {
      throw new Error("New team ID is required");
    }

    await this.missionRepository.reassignMission(missionId, newTeamId);
  }
}
