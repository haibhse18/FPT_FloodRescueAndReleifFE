"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { timelineRepository } from "@/modules/timelines/infrastructure/timeline.repository.impl";
import { missionRepository } from "@/modules/missions/infrastructure/mission.repository.impl";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import { AcceptTimelineUseCase } from "@/modules/timelines/application/acceptTimeline.usecase";
import { ArriveTimelineUseCase } from "@/modules/timelines/application/arriveTimeline.usecase";
import { CompleteTimelineUseCase } from "@/modules/timelines/application/completeTimeline.usecase";
import { FailTimelineUseCase } from "@/modules/timelines/application/failTimeline.usecase";
import { WithdrawTimelineUseCase } from "@/modules/timelines/application/withdrawTimeline.usecase";
import { UpdateMissionRequestProgressUseCase } from "@/modules/missions/application/updateMissionRequestProgress.usecase";
import type {
  TimelineCompleteInput,
  TimelineFailInput,
  TimelineWithdrawInput,
  TimelineCompletionItemInput,
} from "@/modules/timelines/domain/timeline.entity";
import { useNotificationStore } from "@/store/useNotification.store";
import { toast } from "sonner";

const acceptTimelineUseCase = new AcceptTimelineUseCase(timelineRepository);
const arriveTimelineUseCase = new ArriveTimelineUseCase(timelineRepository);
const completeTimelineUseCase = new CompleteTimelineUseCase(timelineRepository);
const failTimelineUseCase = new FailTimelineUseCase(timelineRepository);
const withdrawTimelineUseCase = new WithdrawTimelineUseCase(timelineRepository);
const updateMissionRequestProgressUseCase = new UpdateMissionRequestProgressUseCase(missionRepository);

interface TeamTimelineDetailPageProps {
  timelineId: string;
}

function InternalTeamTimelineDetailPage({
  timelineId,
}: TeamTimelineDetailPageProps) {
  const router = useRouter();
  const notifications = useNotificationStore(state => state.notifications);

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [completionData, setCompletionData] = useState<
    Record<string, { rescuedCount: string; supplies: Record<string, string> }>
  >({});
  const [completeMode, setCompleteMode] = useState<"COMPLETED" | "PARTIAL">(
    "COMPLETED",
  );
  const [completeNote, setCompleteNote] = useState("");
  const [failReason, setFailReason] = useState("");
  const [failNote, setFailNote] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [isOnline, setIsOnline] = useState(true);
  const lastProcessedNotificationRef = useRef<string | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const tl = await timelineRepository.getTimelineDetail(timelineId);
      setTimeline(tl);

      const missionId =
        typeof tl.missionId === "string"
          ? tl.missionId
          : (tl.missionId as any)?._id;
      if (missionId) {
        const m = await missionRepository.getMissionDetail(missionId);
        setMission(m);
        const reqs = await missionRepository.getMissionRequests(missionId);
        setMissionRequests(reqs ?? []);
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải thông tin nhiệm vụ");
    } finally {
      setLoading(false);
    }
  }, [timelineId]);

  useEffect(() => {
    loadData();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (!timeline) return;
    if (notifications.length === 0) return;
    
    const latest = notifications[0];
    const latestId = (latest as any)._id;
    
    // Skip if we already processed this notification
    if (lastProcessedNotificationRef.current === latestId) return;
    
    const missionId =
      typeof timeline.missionId === "string"
        ? timeline.missionId
        : (timeline.missionId as any)?._id;
    
    // Only reload if notification is related to current timeline/mission
    if ((latest as any).timelineId === timeline._id || (latest as any).missionId === missionId) {
      lastProcessedNotificationRef.current = latestId;
      loadData();
    }
  }, [notifications, timeline, loadData]);

  useEffect(() => {
    if (missionRequests.length === 0) return;
    setCompletionData((prev) => {
      const next: typeof prev = { ...prev };
      for (const mr of missionRequests) {
        if (!next[mr._id]) {
          const supplies: Record<string, string> = {};
          ((mr as any).requestSuppliesSnapshot ?? []).forEach((item: any) => {
            const supplyId = item.supplyId?._id ?? item.supplyId;
            if (supplyId) supplies[supplyId] = "";
          });
          next[mr._id] = { rescuedCount: "", supplies };
        }
      }
      return next;
    });
  }, [missionRequests]);

  const canAccept = useMemo(
    () => timeline?.status === "ASSIGNED",
    [timeline?.status],
  );
  const canArrive = useMemo(
    () => timeline?.status === "EN_ROUTE",
    [timeline?.status],
  );
  const canOperateOnSite = useMemo(
    () => timeline?.status === "ON_SITE",
    [timeline?.status],
  );
  const isTerminal = useMemo(
    () =>
      !!timeline &&
      ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"].includes(
        timeline.status,
      ),
    [timeline],
  );

  const handleAccept = async () => {
    if (!timeline || !canAccept) return;
    setActionLoading("accept");
    try {
      const updated = await acceptTimelineUseCase.execute(timeline._id);
      setTimeline(updated);
      toast.success("Đã chấp nhận nhiệm vụ. Bắt đầu di chuyển!");
    } catch (error: any) {
      toast.error(error?.message || "Không thể chấp nhận nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArrive = async () => {
    if (!timeline || !canArrive) return;
    setActionLoading("arrive");
    try {
      const updated = await arriveTimelineUseCase.execute(timeline._id);
      setTimeline(updated);
      toast.success("Đã đánh dấu: đội đang tại hiện trường.");
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái đến hiện trường");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProgress = async (missionRequestId: string) => {
    const form = completionData[missionRequestId];
    if (!form) return;

    const peopleRescuedIncrement = parseInt(form.rescuedCount || "0", 10);
    const suppliesDelivered: { supplyId: string; quantityDelivered: number }[] = [];
    Object.entries(form.supplies).forEach(([supplyId, value]) => {
      const qty = parseFloat(value || "0");
      if (!Number.isNaN(qty) && qty > 0) {
        suppliesDelivered.push({ supplyId, quantityDelivered: qty });
      }
    });

    if (peopleRescuedIncrement <= 0 && suppliesDelivered.length === 0) {
      toast.error("Vui lòng nhập số người mới cứu được hoặc vật tư mới phát.");
      return;
    }

    // Validate supply quantities
    const mr = missionRequests.find(r => r._id === missionRequestId);
    if (mr && (mr as any).requestSuppliesSnapshot) {
      for (const delivered of suppliesDelivered) {
        const requestedSupply = (mr as any).requestSuppliesSnapshot.find(
          (item: any) => (item.supplyId?._id ?? item.supplyId) === delivered.supplyId
        );
        if (requestedSupply && delivered.quantityDelivered > requestedSupply.requestedQty) {
          toast.error(`Vượt quá số lượng yêu cầu cho ${requestedSupply.supplyId?.name || requestedSupply.name}. Yêu cầu: ${requestedSupply.requestedQty}, Nhập: ${delivered.quantityDelivered}`);
          return;
        }
      }
    }

    setActionLoading(`progress_${missionRequestId}`);
    try {
      await updateMissionRequestProgressUseCase.execute(missionRequestId, {
        peopleRescuedIncrement: peopleRescuedIncrement > 0 ? peopleRescuedIncrement : undefined,
        suppliesDelivered: suppliesDelivered.length > 0 ? suppliesDelivered : undefined,
      });

      // Reset the local input for this request
      setCompletionData((prev) => {
        const resetSupplies: Record<string, string> = {};
        Object.keys(prev[missionRequestId]?.supplies || {}).forEach((k) => {
          resetSupplies[k] = "";
        });
        return {
          ...prev,
          [missionRequestId]: { rescuedCount: "", supplies: resetSupplies },
        };
      });

      toast.success("Đã cập nhật tiến độ.");
      await loadData();
    } catch (error: any) {
      if (error?.message?.includes('SUPPLY_OVER_DELIVERY')) {
        toast.error("Vượt quá số lượng vật tư yêu cầu. Vui lòng kiểm tra lại số lượng.");
      } else {
        toast.error(error?.message || "Không thể cập nhật tiến độ");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const buildCompletionPayload = (): TimelineCompleteInput | null => {
    const completions: TimelineCompletionItemInput[] = [];
    const errors: Record<string, string> = {};
    
    for (const mr of missionRequests) {
      const form = completionData[mr._id];
      if (!form) continue;

      const rescuedCount = parseInt(form.rescuedCount || "0", 10);
      const suppliesDelivered: { supplyId: string; quantityDelivered: number }[] =
        [];
      
      // Validate and process supplies
      if ((mr as any).requestSuppliesSnapshot) {
        Object.entries(form.supplies).forEach(([supplyId, value]) => {
          const qty = parseFloat(value || "0");
          if (!Number.isNaN(qty) && qty > 0) {
            const requestedSupply = (mr as any).requestSuppliesSnapshot.find(
              (item: any) => (item.supplyId?._id ?? item.supplyId) === supplyId
            );
            
            if (requestedSupply && qty > requestedSupply.requestedQty) {
              errors[mr._id] = `Vượt quá số lượng cho ${requestedSupply.supplyId?.name || requestedSupply.name}`;
            } else {
              suppliesDelivered.push({ supplyId, quantityDelivered: qty });
            }
          }
        });
      }

      if (rescuedCount > 0 || suppliesDelivered.length > 0) {
        completions.push({
          missionRequestId: mr._id,
          rescuedCount: Number.isFinite(rescuedCount) ? rescuedCount : 0,
          suppliesDelivered: suppliesDelivered.length ? suppliesDelivered : undefined,
        });
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng kiểm tra lại các lỗi validation.");
      return null;
    }

    if (completions.length === 0) {
      toast.error("Vui lòng nhập ít nhất một dòng cứu hộ hoặc vật tư đã phát.");
      return null;
    }

    return {
      outcome: completeMode,
      note: completeNote || undefined,
      completions,
    };
  };

  const handleComplete = async () => {
    if (!timeline || !canOperateOnSite) return;
    
    // Show confirmation dialog
    const confirmMessage = completeMode === "COMPLETED" 
      ? "Bạn có chắc chắn muốn báo cáo hoàn thành đầy đủ nhiệm vụ?"
      : "Bạn có chắc chắn muốn báo cáo hoàn thành một phần nhiệm vụ?";
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    const payload = buildCompletionPayload();
    if (!payload) return;

    setActionLoading("complete");
    try {
      const updated = await completeTimelineUseCase.execute(timeline._id, payload);
      setTimeline(updated);
      toast.success(
        completeMode === "COMPLETED" 
          ? "🎉 Đã hoàn thành đầy đủ nhiệm vụ!"
          : "⚠️ Đã lưu báo cáo hoàn thành một phần."
      );
      await loadData();
    } catch (error: any) {
      if (error?.message?.includes('SUPPLY_OVER_DELIVERY')) {
        toast.error("Vượt quá số lượng vật tư yêu cầu. Vui lòng kiểm tra lại.");
      } else {
        toast.error(error?.message || "Không thể hoàn thành nhiệm vụ");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleFail = async () => {
    if (!timeline || !canOperateOnSite) return;
    if (!failReason.trim()) {
      toast.error("Vui lòng nhập nguyên nhân thất bại.");
      return;
    }
    
    if (!confirm("Bạn có chắc chắn muốn báo cáo thất bại nhiệm vụ?")) {
      return;
    }
    
    const payload: TimelineFailInput = {
      failureReason: failReason.trim(),
      note: failNote || undefined,
    };
    setActionLoading("fail");
    try {
      const updated = await failTimelineUseCase.execute(timeline._id, payload);
      setTimeline(updated);
      toast.success("❌ Đã báo cáo thất bại nhiệm vụ.");
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật thất bại nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!timeline || !canAccept) return;
    if (!withdrawReason.trim()) {
      toast.error("Vui lòng nhập lý do rút khỏi nhiệm vụ.");
      return;
    }
    
    if (!confirm("Bạn có chắc chắn muốn rút khỏi nhiệm vụ? Coordinator sẽ xem xét và có thể gán đội khác.")) {
      return;
    }
    
    const payload: TimelineWithdrawInput = {
      withdrawalReason: withdrawReason.trim(),
      note: undefined,
    };
    setActionLoading("withdraw");
    try {
      const updated = await withdrawTimelineUseCase.execute(timeline._id, payload);
      setTimeline(updated);
      toast.success("🔙 Đã rút khỏi nhiệm vụ. Coordinator sẽ xem xét và gán đội khác.");
      setWithdrawModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Không thể rút khỏi nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-white animate-spin mx-auto" aria-hidden="true" />
          <p className="text-white/60 text-sm">Đang tải thông tin nhiệm vụ...</p>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="p-8 text-center text-white/80">
        <div className="text-5xl mb-3">❓</div>
        <p>Không tìm thấy timeline hoặc bạn không có quyền truy cập.</p>
        <button
          onClick={() => router.push("/missions")}
          className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          ← Quay lại danh sách nhiệm vụ
        </button>
      </div>
    );
  }

  const missionCode =
    mission?.code ??
    (typeof timeline.missionId === "string"
      ? timeline.missionId
      : (timeline.missionId as any)?._id) ??
    "N/A";

  const missionTypeLabel =
    mission?.type === "RELIEF" ? "📦 Nhiệm vụ cứu trợ" : "🚨 Nhiệm vụ cứu hộ";

  return (
    <div className="relative z-10 p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl mx-auto space-y-6">
      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 flex items-center gap-3">
          <div className="text-yellow-300 text-lg">📡</div>
          <div className="flex-1">
            <p className="text-yellow-300 text-sm font-semibold">Mất kết nối internet</p>
            <p className="text-yellow-200/70 text-xs">Một số chức năng có thể không hoạt động. Dữ liệu sẽ được đồng bộ khi kết nối lại.</p>
          </div>
        </div>
      )}
      <button
        onClick={() => router.push("/missions")}
        className="text-sm text-white/70 hover:text-white flex items-center gap-1"
      >
        ← Quay lại danh sách nhiệm vụ
      </button>

      <section className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-white/70">
            {missionCode}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/10 text-white border border-white/20">
            {missionTypeLabel}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {mission?.name ?? "Nhiệm vụ không tên"}
        </h1>
        {mission?.description && (
          <p className="text-sm text-white/80">{mission.description}</p>
        )}
        <div className="text-xs text-white/70 space-y-1">
          <p>
            Trạng thái mission:{" "}
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
              mission?.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              mission?.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
              mission?.status === 'ABORTED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
              mission?.status === 'PARTIAL' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              mission?.status === 'PLANNED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
              mission?.status === 'PAUSED' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/40' :
              'bg-white/10 text-white/80 border border-white/20'
            }`}>
              {mission?.status ?? "N/A"}
            </span>
          </p>
          <p>
            Trạng thái timeline:{" "}
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
              timeline.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
              timeline.status === 'EN_ROUTE' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              timeline.status === 'ON_SITE' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              timeline.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
              timeline.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              timeline.status === 'FAILED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
              timeline.status === 'WITHDRAWN' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/40' :
              'bg-white/10 text-white/80 border border-white/20'
            }`}>
              {timeline.status}
            </span>
          </p>
        </div>
      </section>

      {!isTerminal && (
        <section className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Hành động của đội
          </h2>
          <div className="flex flex-wrap gap-2">
            {canAccept && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading === "accept" || !isOnline}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                  aria-label={actionLoading === "accept" ? "Đang chấp nhận nhiệm vụ" : "Chấp nhận nhiệm vụ"}
                >
                  {actionLoading === "accept" ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      Đang chấp nhận...
                    </>
                  ) : (
                    <>
                      🚀 Chấp nhận nhiệm vụ
                    </>
                  )}
                </button>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={actionLoading === "withdraw" || !isOnline}
                  className="px-4 py-2 rounded-lg bg-red-600/70 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                >
                  {actionLoading === "withdraw" ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      🔙 Rút khỏi nhiệm vụ
                    </>
                  )}
                </button>
              </>
            )}
            {canArrive && (
              <button
                onClick={handleArrive}
                disabled={actionLoading === "arrive" || !isOnline}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
              >
                {actionLoading === "arrive" ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-black animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    📍 Đã đến hiện trường
                  </>
                )}
              </button>
            )}
          </div>
          {canOperateOnSite && (
            <p className="text-xs text-white/70">
              Bạn đang ở hiện trường. Hãy báo cáo kết quả cứu hộ / phát nhu yếu phẩm
              bên dưới.
            </p>
          )}
        </section>
      )}

      {canOperateOnSite && (
        <section className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-white">
              Báo cáo hoàn thành nhiệm vụ
            </h2>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setCompleteMode("COMPLETED")}
                className={`px-3 py-1 rounded-full border ${
                  completeMode === "COMPLETED"
                    ? "bg-green-500 text-white border-green-400"
                    : "bg-white/5 text-white/80 border-white/20"
                }`}
              >
                ✅ Hoàn thành đầy đủ
              </button>
              <button
                onClick={() => setCompleteMode("PARTIAL")}
                className={`px-3 py-1 rounded-full border ${
                  completeMode === "PARTIAL"
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "bg-white/5 text-white/80 border-white/20"
                }`}
              >
                ⚠️ Hoàn thành một phần
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
            {loading ? (
              // Skeleton loaders for mission requests
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="border border-white/15 rounded-xl p-3 space-y-2 bg-white/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse"></div>
                      <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-white/10 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-white/5 rounded w-full animate-pulse"></div>
                    <div className="h-2 bg-white/5 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-7 bg-white/10 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              missionRequests.map((mr) => (
              <div
                key={mr._id}
                className="border border-white/15 rounded-xl p-3 space-y-2 bg-white/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-white/80">
                    <p className="font-semibold">
                      Request: {(mr as any).requestId?._id ?? mr.requestId}
                    </p>
                    <p className="text-[11px]">
                      Người cần cứu: {(mr as any).peopleNeeded ?? (mr as any).requestPeopleSnapshot ?? 0}{" "}
                      | Đã cứu: {mr.peopleRescued ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <label className="text-white/80">
                    Đã cứu (timeline này):{" "}
                    <input
                      type="number"
                      min={0}
                      value={completionData[mr._id]?.rescuedCount ?? ""}
                      onChange={(e) =>
                        setCompletionData((prev) => ({
                          ...prev,
                          [mr._id]: {
                            rescuedCount: e.target.value,
                            supplies: prev[mr._id]?.supplies ?? {},
                          },
                        }))
                      }
                      className="ml-1 w-20 px-2 py-1 rounded bg-white/5 border border-white/20 text-xs text-white"
                    />
                  </label>
                </div>

                {Array.isArray((mr as any).requestSuppliesSnapshot) &&
                  (mr as any).requestSuppliesSnapshot.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] text-white/70 mb-1">
                        Vật tư đã phát (timeline này):
                      </p>
                      <div className="space-y-1">
                        {(mr as any).requestSuppliesSnapshot.map((item: any) => {
                          const supplyId = item.supplyId?._id ?? item.supplyId;
                          const key = String(supplyId);
                          const current =
                            completionData[mr._id]?.supplies?.[key] ?? "";
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-2 text-[11px]"
                            >
                              <span className="text-white/80">
                                {item.supplyId?.name ?? item.name ?? "Vật tư"}{" "}
                                <span className="text-white/60">
                                  ({item.unit ?? "đơn vị"})
                                </span>
                              </span>
                              <input
                                type="number"
                                min={0}
                                value={current}
                                onChange={(e) => {
                                  setValidationErrors(prev => ({ ...prev, [mr._id]: undefined }));
                                  setCompletionData((prev) => ({
                                    ...prev,
                                    [mr._id]: {
                                      rescuedCount:
                                        prev[mr._id]?.rescuedCount ?? "",
                                      supplies: {
                                        ...(prev[mr._id]?.supplies ?? {}),
                                        [key]: e.target.value,
                                      },
                                    },
                                  }));
                                }}
                                className={`w-24 px-2 py-1 rounded bg-white/5 border text-[11px] text-white text-right transition-colors ${
                                  validationErrors[mr._id] 
                                    ? 'border-red-400 focus:border-red-300' 
                                    : 'border-white/20 focus:border-blue-400'
                                }`}
                                placeholder="0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                <div className="flex justify-end mt-3 border-t border-white/10 pt-3">
                  <button
                    onClick={() => handleUpdateProgress(mr._id)}
                    disabled={actionLoading === `progress_${mr._id}` || !isOnline}
                    className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40 text-[11px] font-semibold disabled:opacity-50 transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-1"
                  >
                    {actionLoading === `progress_${mr._id}` ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-blue-300 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        ⬆️ Cập nhật tiến độ này
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-white/80">
              Ghi chú thêm (tuỳ chọn)
            </label>
            <textarea
              rows={3}
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white resize-none"
              placeholder="Nhập ghi chú về tình hình hiện trường, khó khăn, đề xuất bổ sung..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleComplete}
              disabled={actionLoading === "complete" || !isOnline}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
              aria-label={actionLoading === "complete" ? "Đang xử lý hoàn thành nhiệm vụ" : completeMode === "COMPLETED" ? "Xác nhận hoàn thành đầy đủ nhiệm vụ" : "Lưu báo cáo hoàn thành một phần"}
            >
              {actionLoading === "complete" ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {completeMode === "COMPLETED" ? "✅ Xác nhận hoàn thành" : "⚠️ Lưu báo cáo một phần"}
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {canOperateOnSite && !isTerminal && (
        <section className="bg-white/10 border border-red-400/40 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-red-200">
            Báo cáo thất bại nhiệm vụ
          </h2>
          <p className="text-xs text-red-100/80">
            Chỉ sử dụng khi đội không thể hoàn thành nhiệm vụ (không tiếp cận được,
            sự cố phương tiện, thời tiết quá nguy hiểm, ...).
          </p>
          <div className="space-y-2">
            <label className="block text-xs text-red-100">
              Nguyên nhân thất bại *
            </label>
            <textarea
              rows={3}
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/60 text-sm text-red-50 resize-none"
              placeholder="Ví dụ: Đường vào ngập sâu, không thể tiếp cận do nước chảy xiết..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-red-100">
              Ghi chú thêm (tuỳ chọn)
            </label>
            <textarea
              rows={2}
              value={failNote}
              onChange={(e) => setFailNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-red-500/5 border border-red-400/40 text-sm text-red-50 resize-none"
            />
          </div>
          <button
            onClick={handleFail}
            disabled={actionLoading === "fail" || !isOnline}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
          >
            {actionLoading === "fail" ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                ❌ Báo cáo thất bại nhiệm vụ
              </>
            )}
          </button>
        </section>
      )}

      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0b2536] border border-white/20 p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">
              Rút khỏi nhiệm vụ?
            </h3>
            <p className="text-xs text-white/80">
              Nếu bạn rút, nhiệm vụ sẽ quay về Coordinator để xem xét và có thể gán
              cho đội khác. Hãy chỉ rút khi đội bạn thực sự không thể nhận nhiệm vụ.
            </p>
            <div className="space-y-2">
              <label className="block text-xs text-white/80">
                Lý do rút khỏi nhiệm vụ *
              </label>
              <textarea
                rows={3}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white resize-none"
                placeholder="Ví dụ: Đã có sự cố nhân lực/thiết bị, đang thực hiện mission khẩn cấp khác..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleWithdraw}
                disabled={actionLoading === "withdraw" || !isOnline}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
              >
                {actionLoading === "withdraw" ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận rút
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap component with ErrorBoundary
export default function TeamTimelineDetailPage(props: any) {
  return (
    <ErrorBoundary>
      <InternalTeamTimelineDetailPage {...props} />
    </ErrorBoundary>
  );
}

