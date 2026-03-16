import { IMissionRepository } from "../domain/mission.repository";

export class RemoveTeamFromMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string, teamId: string): Promise<void> {
    return this.missionRepository.removeTeam(missionId, teamId);
  }
}
