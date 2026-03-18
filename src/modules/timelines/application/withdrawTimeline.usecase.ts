import { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineWithdrawInput } from "../domain/timeline.entity";

export class WithdrawTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string, input: TimelineWithdrawInput): Promise<Timeline> {
    return this.timelineRepository.withdrawTimeline(timelineId, input);
  }
}

