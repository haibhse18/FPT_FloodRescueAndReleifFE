import { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineCompleteInput } from "../domain/timeline.entity";

export class CompleteTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string, input: TimelineCompleteInput): Promise<Timeline> {
    return this.timelineRepository.completeTimeline(timelineId, input);
  }
}

