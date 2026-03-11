/**
 * Accept Timeline Use Case - Application layer
 * Rescue Team accepts assigned timeline → status EN_ROUTE
 */

import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline } from "../domain/timeline.entity";

export class AcceptTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string): Promise<Timeline> {
    if (!timelineId) throw new Error("Timeline ID is required");
    return this.timelineRepository.acceptTimeline(timelineId);
  }
}
