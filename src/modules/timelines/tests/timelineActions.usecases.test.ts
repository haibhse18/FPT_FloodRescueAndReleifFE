import { describe, expect, it, vi } from "vitest";
import { AcceptTimelineUseCase } from "../application/acceptTimeline.usecase";
import { ArriveTimelineUseCase } from "../application/arriveTimeline.usecase";
import { CompleteTimelineUseCase } from "../application/completeTimeline.usecase";
import { FailTimelineUseCase } from "../application/failTimeline.usecase";
import { WithdrawTimelineUseCase } from "../application/withdrawTimeline.usecase";
import type { ITimelineRepository } from "../domain/timeline.repository";
import type {
  Timeline,
  TimelineCompleteInput,
  TimelineFailInput,
  TimelineWithdrawInput,
} from "../domain/timeline.entity";

function makeTimeline(overrides: Partial<Timeline> = {}): Timeline {
  return {
    _id: "timeline-1",
    missionId: "mission-1",
    teamId: "team-1",
    status: "ASSIGNED",
    createdBy: "user-1",
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
    ...overrides,
  } as Timeline;
}

function makeRepository(): ITimelineRepository {
  return {
    getTimelines: vi.fn(),
    getTimelineDetail: vi.fn(),
    cancelTimeline: vi.fn(),
    acceptTimeline: vi.fn(),
    arriveTimeline: vi.fn(),
    completeTimeline: vi.fn(),
    failTimeline: vi.fn(),
    withdrawTimeline: vi.fn(),
  };
}

describe("Timeline action use cases", () => {
  it("AcceptTimelineUseCase forwards timelineId to repository", async () => {
    const repository = makeRepository();
    const timeline = makeTimeline({ status: "EN_ROUTE" });
    vi.mocked(repository.acceptTimeline).mockResolvedValue(timeline);

    const useCase = new AcceptTimelineUseCase(repository);
    const result = await useCase.execute("timeline-1");

    expect(result).toEqual(timeline);
    expect(repository.acceptTimeline).toHaveBeenCalledWith("timeline-1");
  });

  it("ArriveTimelineUseCase forwards timelineId to repository", async () => {
    const repository = makeRepository();
    const timeline = makeTimeline({ status: "ON_SITE" });
    vi.mocked(repository.arriveTimeline).mockResolvedValue(timeline);

    const useCase = new ArriveTimelineUseCase(repository);
    const result = await useCase.execute("timeline-1");

    expect(result).toEqual(timeline);
    expect(repository.arriveTimeline).toHaveBeenCalledWith("timeline-1");
  });

  it("CompleteTimelineUseCase forwards payload to repository", async () => {
    const repository = makeRepository();
    const timeline = makeTimeline({ status: "COMPLETED" });
    const input: TimelineCompleteInput = {
      outcome: "COMPLETED",
      completions: [{ missionRequestId: "mr-1", rescuedCount: 2 }],
    };
    vi.mocked(repository.completeTimeline).mockResolvedValue(timeline);

    const useCase = new CompleteTimelineUseCase(repository);
    const result = await useCase.execute("timeline-1", input);

    expect(result).toEqual(timeline);
    expect(repository.completeTimeline).toHaveBeenCalledWith("timeline-1", input);
  });

  it("FailTimelineUseCase forwards payload to repository", async () => {
    const repository = makeRepository();
    const timeline = makeTimeline({ status: "FAILED" });
    const input: TimelineFailInput = {
      failureReason: "Blocked by landslide",
      note: "Need heavy equipment",
    };
    vi.mocked(repository.failTimeline).mockResolvedValue(timeline);

    const useCase = new FailTimelineUseCase(repository);
    const result = await useCase.execute("timeline-1", input);

    expect(result).toEqual(timeline);
    expect(repository.failTimeline).toHaveBeenCalledWith("timeline-1", input);
  });

  it("WithdrawTimelineUseCase forwards payload to repository", async () => {
    const repository = makeRepository();
    const timeline = makeTimeline({ status: "WITHDRAWN" });
    const input: TimelineWithdrawInput = {
      withdrawalReason: "Vehicle breakdown",
      note: "Awaiting replacement",
    };
    vi.mocked(repository.withdrawTimeline).mockResolvedValue(timeline);

    const useCase = new WithdrawTimelineUseCase(repository);
    const result = await useCase.execute("timeline-1", input);

    expect(result).toEqual(timeline);
    expect(repository.withdrawTimeline).toHaveBeenCalledWith("timeline-1", input);
  });
});
