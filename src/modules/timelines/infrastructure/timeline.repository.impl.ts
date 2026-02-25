/**
 * Timeline Repository Implementation - Infrastructure layer
 * Implement ITimelineRepository using timelineApi
 */

import { ITimelineRepository } from "../domain/timeline.repository";
import {
  Timeline,
  PaginatedTimelines,
  GetTimelinesFilter,
  TimelineCancelInput,
} from "../domain/timeline.entity";
import { timelineApi } from "./timeline.api";

export class TimelineRepositoryImpl implements ITimelineRepository {
  async getTimelines(
    filters?: GetTimelinesFilter,
  ): Promise<PaginatedTimelines> {
    const response = await timelineApi.getTimelines(filters);
    const result = response as any;
    return {
      data: result.data ?? [],
      total: result.meta?.total ?? 0,
      page: result.meta?.page ?? 1,
      limit: result.meta?.limit ?? 10,
      totalPages: result.meta?.totalPages ?? 1,
    };
  }

  async getTimelineDetail(timelineId: string): Promise<Timeline> {
    const response = await timelineApi.getTimelineDetail(timelineId);
    return ((response as any).data ?? response) as Timeline;
  }

  async cancelTimeline(
    timelineId: string,
    input?: TimelineCancelInput,
  ): Promise<void> {
    await timelineApi.cancelTimeline(timelineId, input);
  }
}

// Singleton instance
export const timelineRepository = new TimelineRepositoryImpl();
