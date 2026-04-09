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
  AcceptTimelineInput,
} from "./timeline.entity";

export interface ITimelineRepository {
  getTimelines(filters?: GetTimelinesFilter): Promise<PaginatedTimelines>;
  getTimelineDetail(timelineId: string): Promise<Timeline>;
  cancelTimeline(
    timelineId: string,
    input?: TimelineCancelInput,
  ): Promise<void>;
  acceptTimeline(timelineId: string, input?: AcceptTimelineInput): Promise<Timeline>;
  confirmSupplyClaim(timelineId: string, note?: string): Promise<Timeline>;
  arriveTimeline(timelineId: string): Promise<Timeline>;
  completeTimeline(
    timelineId: string,
    input: TimelineCompleteInput,
  ): Promise<Timeline>;
  failTimeline(
    timelineId: string,
    input: TimelineFailInput,
  ): Promise<Timeline>;
  withdrawTimeline(
    timelineId: string,
    input: TimelineWithdrawInput,
  ): Promise<Timeline>;
}
