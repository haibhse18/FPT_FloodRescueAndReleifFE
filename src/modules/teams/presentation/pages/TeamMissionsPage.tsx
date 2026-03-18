"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetTimelinesUseCase } from "@/modules/timelines/application/getTimelines.usecase";
import { timelineRepository } from "@/modules/timelines/infrastructure/timeline.repository.impl";
import { GetMissionDetailUseCase } from "@/modules/missions/application/getMissionDetail.usecase";
import { missionRepository } from "@/modules/missions/infrastructure/mission.repository.impl";
import type {
  Timeline,
  TimelineStatus,
} from "@/modules/timelines/domain/timeline.entity";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import { useNotificationStore } from "@/store/useNotification.store";

const STATUS_TABS: { label: string; value: TimelineStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "📋 Đã phân công", value: "ASSIGNED" },
  { label: "🚗 Đang di chuyển", value: "EN_ROUTE" },
  { label: "📍 Tại hiện trường", value: "ON_SITE" },
  { label: "✅ Hoàn thành", value: "COMPLETED" },
  { label: "⚠️ Một phần", value: "PARTIAL" },
  { label: "❌ Thất bại", value: "FAILED" },
  { label: "🔙 Đã rút", value: "WITHDRAWN" },
  { label: "🚫 Đã hủy", value: "CANCELLED" },
];

const TIMELINE_STATUS_CLASSES: Record<string, string> = {
  ASSIGNED: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  EN_ROUTE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  ON_SITE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  COMPLETED: "bg-green-500/20 text-green-300 border-green-500/40",
  PARTIAL: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  FAILED: "bg-red-500/20 text-red-300 border-red-500/40",
  WITHDRAWN: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/40",
};

const TIMELINE_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Đã phân công",
  EN_ROUTE: "Đang di chuyển",
  ON_SITE: "Tại hiện trường",
  COMPLETED: "Hoàn thành",
  PARTIAL: "Hoàn thành một phần",
  FAILED: "Thất bại",
  WITHDRAWN: "Đã rút",
  CANCELLED: "Đã hủy",
};

const getTimelinesUseCase = new GetTimelinesUseCase(timelineRepository);
const getMissionDetailUseCase = new GetMissionDetailUseCase(missionRepository);

export default function TeamMissionsPage() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [missionDetails, setMissionDetails] = useState<Record<string, Mission>>({});
  const [activeTab, setActiveTab] = useState<TimelineStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTimelines = useCallback(
    async (opts?: { resetPage?: boolean }) => {
      setLoading(true);
      try {
        const filters: { status?: TimelineStatus; page: number; limit: number } =
          { page: opts?.resetPage ? 1 : page, limit: 10 };

        if (activeTab !== "ALL") {
          filters.status = activeTab;
        }

        const result = await getTimelinesUseCase.execute(filters);
        setTimelines(result.data ?? []);
        setTotalPages(result.totalPages ?? 1);
        if (opts?.resetPage) {
          setPage(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [activeTab, page],
  );

  // Fetch mission details for timelines
  useEffect(() => {
    if (timelines.length === 0) return;

    const fetchMissionDetails = async () => {
      const missionDetailsMap: Record<string, Mission> = { ...missionDetails };
      
      // Extract mission IDs - handle both string and object formats
      const newMissionIds = timelines
        .map((tl) => {
          const missionId = tl.missionId;
          return typeof missionId === "string" ? missionId : (missionId as any)?._id;
        })
        .filter((id): id is string => !!id && !missionDetailsMap[id]);

      if (newMissionIds.length === 0) return;

      for (const missionId of newMissionIds) {
        try {
          const mission = await getMissionDetailUseCase.execute(missionId);
          missionDetailsMap[missionId] = mission;
        } catch (err) {
          console.error(`Failed to fetch mission ${missionId}:`, err);
        }
      }

      setMissionDetails(missionDetailsMap);
    };

    fetchMissionDetails();
  }, [timelines, missionDetails]);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (latest.missionId) {
      fetchTimelines();
    }
  }, [notifications, fetchTimelines]);

  const handleTabChange = (value: TimelineStatus | "ALL") => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div className="relative z-10 p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🚑 Nhiệm vụ của đội
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Xem thông tin chi tiết mission code, người phân công và thực thi các nhiệm vụ được phân công cho đội của bạn.
            </p>
          </div>
          <button
            onClick={() => fetchTimelines()}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "🔄 Làm mới"}
          </button>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-white text-[var(--color-primary)]"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-white animate-spin" />
          </div>
        ) : timelines.length === 0 ? (
          <div className="py-16 text-center text-white/80 border border-dashed border-white/20 rounded-2xl bg-white/5">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-lg">Hiện chưa có nhiệm vụ nào được phân công.</p>
            <p className="text-sm text-white/60 mt-1">
              Khi Coordinator gán đội vào mission, nhiệm vụ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <section className="space-y-3">
            {timelines.map((tl) => {
              // Extract mission ID - handle both string and object formats
              const missionId = typeof tl.missionId === "string" ? tl.missionId : (tl.missionId as any)?._id;
              const mission = missionId ? missionDetails[missionId] : null;
              
              if (!mission) {
                return (
                  <div
                    key={tl._id}
                    className="w-full text-left bg-white/10 border border-white/20 rounded-2xl p-4 md:p-5 flex items-center gap-3"
                  >
                    <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    <span className="text-white/70 text-sm">Đang tải...</span>
                  </div>
                );
              }

              const missionType =
                mission.type === "RELIEF" ? "📦 Cứu trợ" : "🚨 Cứu hộ";
              const coordinatorName = (
                (mission.coordinatorId as any)?.displayName ||
                (mission.coordinatorId as any)?.userName ||
                "Coordinator"
              );

              return (
                <button
                  key={tl._id}
                  onClick={() =>
                    router.push(`/missions/${encodeURIComponent(tl._id)}`)
                  }
                  className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-white/70">
                        {mission.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] border bg-white/5 text-white/80">
                        {missionType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] border ${
                          TIMELINE_STATUS_CLASSES[tl.status] ??
                          "bg-white/10 text-white border-white/20"
                        }`}
                      >
                        {TIMELINE_STATUS_LABELS[tl.status] ?? tl.status}
                      </span>
                    </div>
                    <h2 className="text-base md:text-lg font-semibold text-white truncate">
                      {mission.name}
                    </h2>
                    <p className="text-xs text-white/70 mt-1">
                      Phân công bởi <span className="font-medium">{coordinatorName}</span> lúc{" "}
                      {tl.assignedAt
                        ? new Date(tl.assignedAt).toLocaleString("vi-VN")
                        : tl.createdAt
                        ? new Date(tl.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 md:w-40 shrink-0">
                    <span className="text-white/80 text-xl md:text-2xl">
                      →
                    </span>
                  </div>
                </button>
              );
            })}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-40 hover:bg-white/20"
                >
                  ←
                </button>
                <span className="text-sm text-white/80">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-40 hover:bg-white/20"
                >
                  →
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
