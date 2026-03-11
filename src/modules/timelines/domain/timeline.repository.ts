/**
 * Timeline Repository Interface - Domain layer
 * Định nghĩa contract cho timeline operations
 */

import {
  Timeline,
  PaginatedTimelines,
  GetTimelinesFilter,
  TimelineCancelInput,
  TimelineCompleteInput,
  TimelineFailInput,
  TimelineWithdrawInput,
} from "./timeline.entity";

export interface ITimelineRepository {
  getTimelines(filters?: GetTimelinesFilter): Promise<PaginatedTimelines>;
  getTimelineDetail(timelineId: string): Promise<Timeline>;
  cancelTimeline(
    timelineId: string,
    input?: TimelineCancelInput,
  ): Promise<void>;
  /** Rescue Team: accept → EN_ROUTE */
  acceptTimeline(timelineId: string): Promise<Timeline>;
  /** Rescue Team: arrive → ON_SITE */
  arriveTimeline(timelineId: string): Promise<Timeline>;
  /** Rescue Team: complete → COMPLETED | PARTIAL */
  completeTimeline(
    timelineId: string,
    input: TimelineCompleteInput,
  ): Promise<Timeline>;
  /** Rescue Team: fail → FAILED */
  failTimeline(
    timelineId: string,
    input: TimelineFailInput,
  ): Promise<Timeline>;
  /** Rescue Team: withdraw → WITHDRAWN */
  withdrawTimeline(
    timelineId: string,
    input: TimelineWithdrawInput,
  ): Promise<Timeline>;
}
