/**
 * Fail Timeline Use Case - Application layer
 * Rescue Team marks timeline as FAILED with reason
 */

import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineFailInput } from "../domain/timeline.entity";

export class FailTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(
    timelineId: string,
    input: TimelineFailInput,
  ): Promise<Timeline> {
    if (!timelineId) throw new Error("Timeline ID is required");
    if (!input?.failureReason?.trim()) throw new Error("Failure reason is required");
    return this.timelineRepository.failTimeline(timelineId, input);
  }
}
