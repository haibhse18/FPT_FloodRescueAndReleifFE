import { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline } from "../domain/timeline.entity";

export class ArriveTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string): Promise<Timeline> {
    return this.timelineRepository.arriveTimeline(timelineId);
  }
}

