import { ITimelineRepository } from "../domain/timeline.repository";
import {
  PaginatedTimelines,
  GetTimelinesFilter,
} from "../domain/timeline.entity";

/**
 * Use Case: Get Timelines
 */
export class GetTimelinesUseCase {
  constructor(private timelineRepository: ITimelineRepository) {}

  async execute(filters?: GetTimelinesFilter): Promise<PaginatedTimelines> {
    return await this.timelineRepository.getTimelines(filters);
  }
}
