import type { ITimelineRepository } from "../domain/timeline.repository";
import type { Timeline } from "../domain/timeline.entity";

export interface ConfirmSupplyClaimInput {
  note?: string;
}

export class ConfirmSupplyClaimUseCase {
  constructor(private timelineRepository: ITimelineRepository) {}

  async execute(timelineId: string, input?: ConfirmSupplyClaimInput): Promise<Timeline> {
    return this.timelineRepository.confirmSupplyClaim(timelineId, input?.note);
  }
}
