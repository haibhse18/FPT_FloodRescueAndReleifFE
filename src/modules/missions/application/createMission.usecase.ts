import { IMissionRepository } from "../domain/mission.repository";
import { Mission, CreateMissionInput } from "../domain/mission.entity";

/**
 * Use Case: Create Mission (status = PLANNED)
 */
export class CreateMissionUseCase {
  constructor(private missionRepository: IMissionRepository) {}

  async execute(input: CreateMissionInput): Promise<Mission> {
    if (!input.name?.trim()) throw new Error("Mission name is required");
    if (!input.type) throw new Error("Mission type is required");
    return await this.missionRepository.createMission(input);
  }
}
