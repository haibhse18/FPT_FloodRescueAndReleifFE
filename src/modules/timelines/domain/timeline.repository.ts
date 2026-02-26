/**
 * Timeline Repository Interface - Domain layer
 * Định nghĩa contract cho timeline operations
 */

import {
  Timeline,
  PaginatedTimelines,
  GetTimelinesFilter,
  TimelineCancelInput,
} from "./timeline.entity";

export interface ITimelineRepository {
  getTimelines(filters?: GetTimelinesFilter): Promise<PaginatedTimelines>;
  getTimelineDetail(timelineId: string): Promise<Timeline>;
  cancelTimeline(
    timelineId: string,
    input?: TimelineCancelInput,
  ): Promise<void>;
}
