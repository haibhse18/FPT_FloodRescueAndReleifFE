/**
 * Withdraw Timeline Use Case - Application layer
 * Rescue Team withdraws from assigned timeline → status WITHDRAWN
 */

import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline, TimelineWithdrawInput } from "../domain/timeline.entity";

export class WithdrawTimelineUseCase {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async execute(
    timelineId: string,
    input: TimelineWithdrawInput,
  ): Promise<Timeline> {
    if (!timelineId) throw new Error("Timeline ID is required");
    if (!input?.withdrawalReason?.trim()) throw new Error("Withdrawal reason is required");
    return this.timelineRepository.withdrawTimeline(timelineId, input);
  }
}
