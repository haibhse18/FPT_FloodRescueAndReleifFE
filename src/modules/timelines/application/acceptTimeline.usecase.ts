import { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, AcceptTimelineInput } from "../domain/timeline.entity";

export class AcceptTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string, input?: AcceptTimelineInput): Promise<Timeline> {
    return this.timelineRepository.acceptTimeline(timelineId, input);
  }
}

