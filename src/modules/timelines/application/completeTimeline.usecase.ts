/**
 * Complete Timeline Use Case - Application layer
 * Rescue Team completes timeline with outcome COMPLETED | PARTIAL
 */

import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineCompleteInput } from "../domain/timeline.entity";

export class CompleteTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(
    timelineId: string,
    input: TimelineCompleteInput,
  ): Promise<Timeline> {
    if (!timelineId) throw new Error("Timeline ID is required");
    if (!input?.outcome) throw new Error("Outcome (COMPLETED | PARTIAL) is required");
    return this.timelineRepository.completeTimeline(timelineId, input);
  }
}
