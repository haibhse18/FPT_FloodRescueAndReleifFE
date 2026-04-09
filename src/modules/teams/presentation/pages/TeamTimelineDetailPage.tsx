"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
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

import { warehouseApi } from "@/modules/warehouse/infrastructure/warehouse.api";
import { comboSupplyApi } from "@/modules/supplies/infrastructure/comboSupply.api";
import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import type { ComboSupply } from "@/modules/supplies/domain/comboSupply.entity";

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
  const [completeNote, setCompleteNote] = useState("");
  const [failReason, setFailReason] = useState("");
  const [failNote, setFailNote] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [combos, setCombos] = useState<ComboSupply[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedComboId, setSelectedComboId] = useState<string>("");
  const lastProcessedNotificationRef = useRef<string | null>(null);

  // Confetti animation for COMPLETED status
  const showConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

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
    
    // Fetch warehouses
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseApi.getWarehouses();
        if (res && Array.isArray(res.data)) {
          setWarehouses(res.data);
          if (res.data.length > 0) setSelectedWarehouseId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch warehouses", err);
      }
    };
    fetchWarehouses();
  }, []); // Empty dependency array - only run once on mount

  // Fetch combos when mission is loaded
  useEffect(() => {
    if (!mission) return;
    const fetchCombos = async () => {
      try {
        const res = await comboSupplyApi.getComboSupplies();
        if (res && Array.isArray(res.data)) {
          setCombos(res.data);
          if (res.data.length > 0) setSelectedComboId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch combos", err);
      }
    };
    fetchCombos();
  }, [mission]);

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

  // Initialize completion data for each mission request
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
    
    if (!selectedWarehouseId || !selectedComboId) {
      toast.error("Vui lòng chọn kho và gói nhu yếu phẩm.");
      return;
    }

    setActionLoading("accept");
    try {
      // 1. Accept the timeline
      const updated = await acceptTimelineUseCase.execute(timeline._id);
      
      // 2. Create supply request
      const combo = combos.find(c => c._id === selectedComboId);
      if (combo && missionRequests.length > 0) {
        // Send request for each mission request or one big request
        // The user said "request Supply se duoc gui qua cho manager"
        // Let's create a supply request for the first mission request for now, or unified if API supports
        const items = combo.supplies.map(s => ({
          name: typeof s.supplyId === 'string' ? 'Vật tư' : (s.supplyId as any).name,
          category: (typeof s.supplyId === 'string' ? 'OTHER' : (s.supplyId as any).category) as any,
          quantity: s.quantity,
          unit: typeof s.supplyId === 'string' ? "đơn vị" : (s.supplyId as any).unit
        }));

        await supplyApi.createSupplyRequest({
          requestId: missionRequests[0]._id, // Associate with first request in mission
          items,
          priority: mission?.priority?.toLowerCase() as any || 'medium'
        });
        
        toast.success("Đã chấp nhận nhiệm vụ và gửi yêu cầu vật tư tới Manager!");
      } else {
        toast.success("Đã chấp nhận nhiệm vụ!");
      }
      
      setTimeline(updated);
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

  // Poll timeline status to detect auto-complete
  const pollTimelineStatus = async (maxAttempts = 5) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      try {
        const updated = await timelineRepository.getTimelineDetail(timelineId);
        
        if (['COMPLETED', 'PARTIAL', 'WITHDRAWN'].includes(updated.status)) {
          // Auto-complete detected!
          setTimeline(updated);
          
          if (updated.status === 'COMPLETED') {
            showConfetti();
            toast.success('🎉 Timeline đã tự động hoàn tất với kết quả: COMPLETED!');
          } else if (updated.status === 'PARTIAL') {
            toast.info('⚠️ Timeline đã tự động hoàn tất với kết quả: PARTIAL');
          } else if (updated.status === 'WITHDRAWN') {
            toast.info('🔙 Timeline đã tự động hoàn tất với kết quả: WITHDRAWN');
          }
          
          await loadData(); // Refresh all data
          break;
        }
      } catch (error) {
        console.error('Error polling timeline status:', error);
        break;
      }
    }
  };

  const handleUpdateProgress = async (missionRequestId: string) => {
    const form = completionData[missionRequestId];
    if (!form) return;

    const peopleRescuedIncrement = parseInt(form.rescuedCount || "0", 10);
    const mr = missionRequests.find(r => r._id === missionRequestId);
    const suppliesDelivered: { name: string; deliveredQty: number }[] = [];
    
    Object.entries(form.supplies).forEach(([supplyId, value]) => {
      const qty = parseFloat(value || "0");
      if (!Number.isNaN(qty) && qty > 0) {
        // Find supply name from requestSuppliesSnapshot
        let supplyName = "Unknown";
        if (mr && (mr as any).requestSuppliesSnapshot) {
          const requestedSupply = (mr as any).requestSuppliesSnapshot.find(
            (item: any) => (item.supplyId?._id ?? item.supplyId) === supplyId
          );
          if (requestedSupply) {
            supplyName = requestedSupply.supplyId?.name || requestedSupply.name || "Unknown";
          }
        }
        suppliesDelivered.push({ name: supplyName, deliveredQty: qty });
      }
    });

    if (peopleRescuedIncrement <= 0 && suppliesDelivered.length === 0) {
      toast.error("Vui lòng nhập số người mới cứu được hoặc vật tư mới phát.");
      return;
    }

    // Validate supply quantities
    if (mr && (mr as any).requestSuppliesSnapshot) {
      for (const delivered of suppliesDelivered) {
        const requestedSupply = (mr as any).requestSuppliesSnapshot.find(
          (item: any) => (item.supplyId?.name || item.name) === delivered.name
        );
        if (requestedSupply && delivered.deliveredQty > requestedSupply.requestedQty) {
          toast.error(`Vượt quá số lượng yêu cầu cho ${delivered.name}. Yêu cầu: ${requestedSupply.requestedQty}, Nhập: ${delivered.deliveredQty}`);
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
      
      // Poll timeline status to detect auto-complete
      pollTimelineStatus();
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

  // Count incomplete TeamRequests (for confirmation dialog)
  const getIncompleteTeamRequestsCount = () => {
    // Note: We need to check TeamRequest data, not MissionRequest
    // For now, we'll show a warning if there are any MissionRequests
    // In a real implementation, we'd fetch TeamRequest data from API
    return 0; // Placeholder - will be updated when we have TeamRequest API
  };

  const handleComplete = async () => {
    if (!timeline || !canOperateOnSite) return;
    
    const incompleteCount = getIncompleteTeamRequestsCount();
    
    // Show confirmation dialog with warning if there are incomplete TeamRequests
    let confirmMessage = "Bạn có chắc chắn muốn hoàn tất nhiệm vụ?\n\n";
    confirmMessage += "Hệ thống sẽ tự động tính toán kết quả dựa trên các TeamRequest đã hoàn thành.";
    
    if (incompleteCount > 0) {
      confirmMessage += `\n\n⚠️ Cảnh báo: Còn ${incompleteCount} TeamRequest chưa hoàn thành. Bạn có chắc muốn tiếp tục?`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setActionLoading("complete");
    try {
      const payload: TimelineCompleteInput = {
        note: completeNote || undefined,
      };
      
      const updated = await completeTimelineUseCase.execute(timeline._id, payload);
      setTimeline(updated);
      
      // Check if this was a new completion or already completed (idempotent)
      const isAlreadyCompleted = timeline.status !== "ON_SITE";
      
      if (isAlreadyCompleted) {
        toast.info("Timeline đã được hoàn tất trước đó");
      } else {
        // Show success message based on outcome
        if (updated.status === "COMPLETED") {
          showConfetti();
          toast.success("🎉 Timeline đã hoàn tất với kết quả: COMPLETED");
        } else if (updated.status === "PARTIAL") {
          toast.success("⚠️ Timeline đã hoàn tất với kết quả: PARTIAL");
        } else if (updated.status === "WITHDRAWN") {
          toast.info("🔙 Timeline đã hoàn tất với kết quả: WITHDRAWN");
        }
      }
      
      await loadData();
    } catch (error: any) {
      if (error?.message?.includes('NO_TEAM_REQUESTS_FOUND')) {
        toast.error("Không thể hoàn tất timeline khi mission chưa start (chưa có TeamRequest)");
      } else if (error?.message?.includes('TIMELINE_NOT_ON_SITE')) {
        toast.error("Timeline phải ở trạng thái ON_SITE mới có thể hoàn tất");
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
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
              timeline.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
              timeline.status === 'EN_ROUTE' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              timeline.status === 'ON_SITE' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              timeline.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
              timeline.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              timeline.status === 'FAILED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
              timeline.status === 'WITHDRAWN' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/40' :
              'bg-white/10 text-white/80 border border-white/20'
            }`}>
              {timeline.status === 'COMPLETED' && <FaCheckCircle className="text-[10px]" />}
              {timeline.status === 'PARTIAL' && <FaExclamationTriangle className="text-[10px]" />}
              {timeline.status === 'WITHDRAWN' && <FaArrowLeft className="text-[10px]" />}
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
              <div className="w-full space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Chọn Kho hàng lấy vật tư</label>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(e.target.value)}
                      className="w-full h-10 rounded-lg bg-white/5 border border-white/20 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="" disabled className="bg-gray-800">Chọn kho...</option>
                      {warehouses.map(w => (
                        <option key={w._id} value={w._id} className="bg-gray-800">🏭 {w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Chọn Gói nhu yếu phẩm (Combo)</label>
                    <select
                      value={selectedComboId}
                      onChange={(e) => setSelectedComboId(e.target.value)}
                      className="w-full h-10 rounded-lg bg-white/5 border border-white/20 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="" disabled className="bg-gray-800">Chọn combo...</option>
                      {combos.map(c => (
                        <option key={c._id} value={c._id} className="bg-gray-800">📦 {c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hiển thị chi tiết combo đã chọn */}
                {selectedComboId && (() => {
                  const selectedCombo = combos.find(c => c._id === selectedComboId);
                  if (!selectedCombo) return null;
                  return (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
                      <p className="text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        📦 Chi tiết combo: {selectedCombo.name}
                      </p>
                      {selectedCombo.description && (
                        <p className="text-white/70 text-xs">{selectedCombo.description}</p>
                      )}
                      {selectedCombo.supplies && selectedCombo.supplies.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                          {selectedCombo.supplies.map((item, idx) => {
                            const supplyName = typeof item.supplyId === "object" ? (item.supplyId as any)?.name : item.supplyId;
                            const supplyUnit = typeof item.supplyId === "object" ? (item.supplyId as any)?.unit : "";
                            return (
                              <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                                <span className="text-sm">🧴</span>
                                <span className="text-white text-xs font-medium flex-1">{supplyName || `Vật tư ${idx + 1}`}</span>
                                <span className="text-blue-300 text-xs font-bold">×{item.quantity} {supplyUnit}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-white/50 text-xs mt-1">
                        ⚠️ Yêu cầu vật tư sẽ được gửi tới Manager để phân bổ kho sau khi chấp nhận.
                      </p>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap gap-2">
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
                </div>
              </div>
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
          <h2 className="text-sm font-semibold text-white">
            Cập nhật tiến độ từng yêu cầu
          </h2>
          <p className="text-xs text-white/70">
            Nhập số người đã cứu và vật tư đã phát cho từng yêu cầu. Sau khi cập nhật xong tất cả, bạn có thể hoàn tất nhiệm vụ ở phần bên dưới.
          </p>

          <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="border border-white/15 rounded-xl p-3 space-y-2 bg-white/5"
                >
                  <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse"></div>
                  <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse"></div>
                </div>
              ))
            ) : missionRequests.length === 0 ? (
              <p className="text-xs text-white/60 italic text-center py-4">
                Chưa có yêu cầu nào trong nhiệm vụ này.
              </p>
            ) : (
              missionRequests.map((mr) => (
                <div
                  key={mr._id}
                  className="border border-white/15 rounded-xl p-3 space-y-3 bg-white/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-white/80">
                      <p className="font-semibold">
                        Request #{(mr as any).requestId?._id?.slice(-6) ?? mr.requestId.slice(-6)}
                      </p>
                      <p className="text-[11px]">
                        Người cần cứu: {(mr as any).peopleNeeded ?? (mr as any).requestPeopleSnapshot ?? 0} | 
                        Đã cứu: {mr.peopleRescued ?? 0}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      mr.status === 'CLOSED' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                      mr.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      mr.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {mr.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    <label className="text-white/80">
                      Số người mới cứu được:{" "}
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
                        placeholder="0"
                      />
                    </label>
                  </div>

                  {Array.isArray((mr as any).requestSuppliesSnapshot) &&
                    (mr as any).requestSuppliesSnapshot.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] text-white/70 mb-1">
                          Vật tư mới phát:
                        </p>
                        <div className="space-y-1">
                          {(mr as any).requestSuppliesSnapshot.map((item: any) => {
                            const supplyId = item.supplyId?._id ?? item.supplyId;
                            const key = String(supplyId);
                            const current = completionData[mr._id]?.supplies?.[key] ?? "";
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
                                  step="0.1"
                                  value={current}
                                  onChange={(e) => {
                                    setCompletionData((prev) => ({
                                      ...prev,
                                      [mr._id]: {
                                        rescuedCount: prev[mr._id]?.rescuedCount ?? "",
                                        supplies: {
                                          ...(prev[mr._id]?.supplies ?? {}),
                                          [key]: e.target.value,
                                        },
                                      },
                                    }));
                                  }}
                                  className="w-24 px-2 py-1 rounded bg-white/5 border border-white/20 text-[11px] text-white text-right"
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
                          ⬆️ Cập nhật tiến độ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {canOperateOnSite && (
        <section className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">
            Hoàn tất nhiệm vụ
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-xs text-white/70">
              Tổng quan tiến độ nhiệm vụ:
            </p>
            {missionRequests.length === 0 ? (
              <p className="text-xs text-white/60 italic">Chưa có yêu cầu nào trong nhiệm vụ này.</p>
            ) : (
              <div className="space-y-2">
                {missionRequests.map((mr) => (
                  <div
                    key={mr._id}
                    className="border border-white/10 rounded-lg p-3 bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs text-white/90 font-semibold">
                        Request #{(mr as any).requestId?._id?.slice(-6) ?? mr.requestId.slice(-6)}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        mr.status === 'CLOSED' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                        mr.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                        mr.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        'bg-white/10 text-white/70 border border-white/20'
                      }`}>
                        {mr.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70 space-y-1">
                      <p>
                        Người cần cứu: {(mr as any).peopleNeeded ?? (mr as any).requestPeopleSnapshot ?? 0} | 
                        Đã cứu: <span className="text-white/90 font-semibold">{mr.peopleRescued ?? 0}</span>
                      </p>
                      <p>
                        Tiến độ: <span className="text-white/90 font-semibold">{mr.fulfillmentPercent ?? 0}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/80">
                <span className="font-semibold">{missionRequests.filter(mr => mr.status === 'CLOSED' || mr.status === 'PARTIAL').length}</span> / {missionRequests.length} yêu cầu đã hoàn thành
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-white/80">
              Ghi chú hoàn tất (tuỳ chọn)
            </label>
            <textarea
              rows={3}
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white resize-none"
              placeholder="Nhập ghi chú về tình hình hiện trường, khó khăn, đề xuất bổ sung..."
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-200">
              ℹ️ Kết quả (COMPLETED/PARTIAL/WITHDRAWN) sẽ được hệ thống tự động tính toán dựa trên các TeamRequest đã hoàn thành.
            </p>
          </div>

          <button
            onClick={handleComplete}
            disabled={actionLoading === "complete" || !isOnline}
            className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
          >
            {actionLoading === "complete" ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                ✅ Hoàn tất nhiệm vụ
              </>
            )}
          </button>
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

