import { ITimelineRepository } from "../domain/timeline.repository";
import { TimelineCancelInput } from "../domain/timeline.entity";

/**
 * Use Case: Cancel Timeline (Coordinator)
 */
export class CancelTimelineUseCase {
  constructor(private timelineRepository: ITimelineRepository) {}

  async execute(
    timelineId: string,
    input?: TimelineCancelInput,
  ): Promise<void> {
    if (!timelineId) throw new Error("Timeline ID is required");
    await this.timelineRepository.cancelTimeline(timelineId, input);
  }
}
