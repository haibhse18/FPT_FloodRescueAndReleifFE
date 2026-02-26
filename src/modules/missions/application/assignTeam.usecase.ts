import { IMissionRepository } from "../domain/mission.repository";
import { AssignTeamInput } from "../domain/mission.entity";
import { Timeline } from "@/modules/timelines/domain/timeline.entity";

/**
 * Use Case: Assign Team to Mission
 * Creates a Timeline with status ASSIGNED
 */
export class AssignTeamUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(missionId: string, input: AssignTeamInput): Promise<Timeline> {
    if (!missionId) throw new Error("Mission ID is required");
    if (!input.teamId) throw new Error("Team ID is required");
    if (!input.requestId) throw new Error("Request ID is required");
    return await this.missionRepository.assignTeam(missionId, input);
  }
}
