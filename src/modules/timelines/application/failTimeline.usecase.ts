import { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineFailInput } from "../domain/timeline.entity";

export class FailTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string, input: TimelineFailInput): Promise<Timeline> {
    return this.timelineRepository.failTimeline(timelineId, input);
  }
}

