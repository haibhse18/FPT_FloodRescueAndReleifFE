import { IMissionRepository } from "../domain/mission.repository";
import { Timeline } from "@/modules/timelines/domain/timeline.entity";

export class AddTeamsToMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(
    missionId: string,
    input: { teamIds: string[]; note?: string }
  ): Promise<Timeline[]> {
    return this.missionRepository.addTeams(missionId, input);
  }
}
