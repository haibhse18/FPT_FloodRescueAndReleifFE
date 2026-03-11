/**
 * Arrive Timeline Use Case - Application layer
 * Rescue Team marks arrived on site → status ON_SITE
 */

import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline } from "../domain/timeline.entity";

export class ArriveTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string): Promise<Timeline> {
    if (!timelineId) throw new Error("Timeline ID is required");
    return this.timelineRepository.arriveTimeline(timelineId);
  }
}
