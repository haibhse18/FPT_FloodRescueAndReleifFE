"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import "../styles/mission-detail-colors.css";
import MissionProgressStepper from "./MissionProgressStepper";
import AssignedStepView from "./AssignedStepView";
import ClaimStepView from "./ClaimStepView";
import EnRouteStepView from "./EnRouteStepView";
import InProgressStepView from "./InProgressStepView";
import CompletedStepView from "./CompletedStepView";
import { timelineRepository } from "@/modules/timelines/infrastructure/timeline.repository.impl";
import { missionRepository } from "@/modules/missions/infrastructure/mission.repository.impl";
import { teamRequestRepository } from "@/modules/teamRequests/infrastructure/teamRequest.repository.impl";
import { AcceptTimelineUseCase } from "@/modules/timelines/application/acceptTimeline.usecase";
import { ConfirmSupplyClaimUseCase } from "@/modules/timelines/application/confirmSupplyClaim.usecase";
import { ArriveTimelineUseCase } from "@/modules/timelines/application/arriveTimeline.usecase";
import { CompleteTimelineUseCase } from "@/modules/timelines/application/completeTimeline.usecase";
import { WithdrawTimelineUseCase } from "@/modules/timelines/application/withdrawTimeline.usecase";
import { UpdateMissionRequestProgressUseCase } from "@/modules/missions/application/updateMissionRequestProgress.usecase";
import { GetTeamRequestsUseCase } from "@/modules/teamRequests/application/getTeamRequests.usecase";
import { CompleteTeamRequestUseCase } from "@/modules/teamRequests/application/completeTeamRequest.usecase";
import { useNotificationStore } from "@/store/useNotification.store";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { TeamRequest } from "@/modules/teamRequests/domain/teamRequest.entity";

const acceptTimelineUseCase = new AcceptTimelineUseCase(timelineRepository);
const confirmSupplyClaimUseCase = new ConfirmSupplyClaimUseCase(timelineRepository);
const arriveTimelineUseCase = new ArriveTimelineUseCase(timelineRepository);
const completeTimelineUseCase = new CompleteTimelineUseCase(timelineRepository);
const withdrawTimelineUseCase = new WithdrawTimelineUseCase(timelineRepository);
const updateMissionRequestProgressUseCase = new UpdateMissionRequestProgressUseCase(missionRepository);
const getTeamRequestsUseCase = new GetTeamRequestsUseCase(teamRequestRepository);
const completeTeamRequestUseCase = new CompleteTeamRequestUseCase(teamRequestRepository);

interface MissionDetailPageProps {
  timelineId: string;
}

const normalizeTimelineStatus = (status: string): string => {
  const normalized = status?.trim().toUpperCase();

  if (normalized === "PENDING_APPROVAL" || normalized === "CLAIMING_SUPPLIES") {
    return normalized;
  }

  if (normalized.includes("APPROVAL") || (normalized.includes("CLAIM") && normalized.includes("SUPPL"))) {
    return "CLAIMING_SUPPLIES";
  }

  return normalized;
};

export default function MissionDetailPage({ timelineId }: MissionDetailPageProps) {
  const router = useRouter();
  const notifications = useNotificationStore(state => state.notifications);

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const lastProcessedNotificationRef = useRef<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [viewingStep, setViewingStep] = useState<number | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refetch data function for action handlers
  const refetchData = useCallback(async () => {
    try {
      const tl = await timelineRepository.getTimelineDetail(timelineId);
      setTimeline(tl);

      const missionId = typeof tl.missionId === "string" 
        ? tl.missionId 
        : (tl.missionId as any)?._id;
      
      if (missionId) {
        const [m, reqs, teamReqs] = await Promise.all([
          missionRepository.getMissionDetail(missionId),
          missionRepository.getMissionRequests(missionId),
          getTeamRequestsUseCase.execute({ missionId }),
        ]);
        
        setMission(m);
        setMissionRequests(reqs ?? []);
        setTeamRequests(teamReqs.data ?? []);
      }
    } catch (error: any) {
      console.error("Failed to refetch data:", error);
    }
  }, [timelineId]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const tl = await timelineRepository.getTimelineDetail(timelineId);
        setTimeline(tl);

        const missionId = typeof tl.missionId === "string" 
          ? tl.missionId 
          : (tl.missionId as any)?._id;
        
        if (missionId) {
          const [m, reqs, teamReqs] = await Promise.all([
            missionRepository.getMissionDetail(missionId),
            missionRepository.getMissionRequests(missionId),
            getTeamRequestsUseCase.execute({ missionId }),
          ]);
          
          setMission(m);
          setMissionRequests(reqs ?? []);
          setTeamRequests(teamReqs.data ?? []);
        }
      } catch (error: any) {
        toast.error(error?.message || "Không thể tải thông tin nhiệm vụ");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timelineId]);

  // Listen to notifications - only refetch when there's a new relevant notification
  useEffect(() => {
    if (!timeline || notifications.length === 0) return;
    
    const latest = notifications[0];
    const latestId = (latest as any)._id || (latest as any).id;
    
    // Skip if we've already processed this notification
    if (latestId === lastProcessedNotificationRef.current) return;
    
    const missionId = typeof timeline.missionId === "string" 
      ? timeline.missionId 
      : (timeline.missionId as any)?._id;
    
    // Only refetch if notification is related to this timeline/mission
    if ((latest as any).timelineId === timeline._id || (latest as any).missionId === missionId) {
      lastProcessedNotificationRef.current = latestId;
      refetchData();
    }
  }, [notifications, timeline, refetchData]);

  const handleAccept = async (payload?: any) => {
    if (!timeline) return;
    setActionLoading("accept");
    try {
      const updated = await acceptTimelineUseCase.execute(timeline._id, payload);
      setTimeline(updated);
      toast.success("Đã chấp nhận nhiệm vụ!");
      await refetchData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể chấp nhận nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!timeline) return;
    
    const reason = prompt("Vui lòng nhập lý do từ chối nhiệm vụ:");
    if (!reason?.trim()) return;
    
    if (!confirm("Bạn có chắc chắn muốn từ chối nhiệm vụ này?")) return;
    
    setActionLoading("reject");
    try {
      const updated = await withdrawTimelineUseCase.execute(timeline._id, {
        withdrawalReason: reason.trim(),
      });
      setTimeline(updated);
      toast.success("Đã từ chối nhiệm vụ");
      setTimeout(() => router.push("/missions-history"), 1500);
    } catch (error: any) {
      toast.error(error?.message || "Không thể từ chối nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArrived = async () => {
    if (!timeline) return;
    setActionLoading("arrive");
    try {
      const updated = await arriveTimelineUseCase.execute(timeline._id);
      setTimeline(updated);
      toast.success("Đã đánh dấu: đội đang tại hiện trường");
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProgress = async (
    missionRequestId: string,
    data: {
      peopleRescuedIncrement?: number;
      suppliesDelivered?: { name: string; deliveredQty: number }[];
    }
  ) => {
    setActionLoading(`progress_${missionRequestId}`);
    try {
      await updateMissionRequestProgressUseCase.execute(missionRequestId, data);
      toast.success("Đã cập nhật tiến độ");
      await refetchData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật tiến độ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRequest = async (teamRequestId: string, note?: string) => {
    setActionLoading(`complete_${teamRequestId}`);
    try {
      await completeTeamRequestUseCase.execute(teamRequestId, { note });
      toast.success("Đã hoàn tất yêu cầu");
      await refetchData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể hoàn tất yêu cầu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmClaim = async () => {
    if (!timeline) return;
    
    setActionLoading("confirm_claim");
    try {
      const updated = await confirmSupplyClaimUseCase.execute(timeline._id);
      setTimeline(updated);
      toast.success("✅ Đã xác nhận nhận vật tư. Bắt đầu di chuyển!");
      await refetchData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể xác nhận");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteMission = async () => {
    if (!timeline) return;
    
    if (!confirm("Bạn có chắc chắn muốn hoàn tất nhiệm vụ?\n\nHệ thống sẽ tự động tính toán kết quả.")) {
      return;
    }
    
    setActionLoading("complete_mission");
    try {
      const updated = await completeTimelineUseCase.execute(timeline._id, {});
      setTimeline(updated);
      
      if (updated.status === "COMPLETED") {
        toast.success("🎉 Nhiệm vụ đã hoàn tất với kết quả: COMPLETED");
      } else if (updated.status === "PARTIAL") {
        toast.success("⚠️ Nhiệm vụ đã hoàn tất với kết quả: PARTIAL");
      }
      
      await refetchData();
    } catch (error: any) {
      toast.error(error?.message || "Không thể hoàn tất nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-white animate-spin mx-auto" />
          <p className="text-white/60 text-sm">Đang tải thông tin nhiệm vụ...</p>
        </div>
      </div>
    );
  }

  if (!timeline || !mission) {
    return (
      <div className="p-8 text-center text-white/80">
        <div className="text-5xl mb-3">❓</div>
        <p>Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập.</p>
        <button
          onClick={() => router.push("/missions-history")}
          className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          ← Quay lại danh sách nhiệm vụ
        </button>
      </div>
    );
  }

  const missionCode = mission.code || "N/A";
  const missionTypeLabel = mission.type === "RELIEF" ? "📦 Cứu trợ" : "🚨 Cứu hộ";
  const normalizedStatus = normalizeTimelineStatus(String(timeline.status || ""));
  const isTerminal = ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"].includes(normalizedStatus);

  // Step navigation logic
  const getCurrentStepIndex = () => {
    if (normalizedStatus === "ASSIGNED") return 0;
    if (normalizedStatus === "PENDING_APPROVAL") return 1;
    if (normalizedStatus === "CLAIMING_SUPPLIES") return 1;
    if (normalizedStatus === "EN_ROUTE") return 2;
    if (normalizedStatus === "ON_SITE") return 3;
    if (isTerminal) return 4;
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const displayStepIndex = viewingStep !== null ? viewingStep : currentStepIndex;

  const handleStepClick = (stepIndex: number) => {
    // Only allow viewing current or previous steps
    if (stepIndex <= currentStepIndex) {
      setViewingStep(stepIndex === currentStepIndex ? null : stepIndex);
    }
  };

  return (
    <div className="mission-detail-scope relative z-10 h-screen flex flex-col overflow-hidden">
      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex-shrink-0 bg-yellow-500/20 border border-yellow-500/40 p-3 flex items-center gap-3">
          <div className="text-yellow-300 text-lg">📡</div>
          <div className="flex-1">
            <p className="text-yellow-300 text-sm font-semibold">Mất kết nối internet</p>
            <p className="text-yellow-200/70 text-xs">Một số chức năng có thể không hoạt động</p>
          </div>
        </div>
      )}

      {/* Header - Single Row with Stepper */}
      <div className="flex-shrink-0 bg-white/5 border-b border-white/20 z-20 backdrop-blur-sm h-20">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-3 lg:gap-6">
          {/* Left: Back Icon + Mission Info */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-shrink-0">
            <button
              onClick={() => router.push("/missions-history")}
              className="text-white/70 hover:text-white transition-colors flex-shrink-0"
              title="Quay lại"
            >
              <FaArrowLeft className="text-base lg:text-lg" />
            </button>
            
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <h1 className="text-sm lg:text-base font-bold text-white truncate">{mission.name}</h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white border border-white/20 whitespace-nowrap flex-shrink-0">
                {missionTypeLabel}
              </span>
              <span className="hidden md:inline-block text-xs font-mono text-white/70 whitespace-nowrap flex-shrink-0">{missionCode}</span>
            </div>
          </div>

          {/* Center: Stepper (compact) - Centered with equal flex on both sides */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="max-w-2xl w-full">
              <MissionProgressStepper 
                currentStatus={normalizedStatus}
                onStepClick={handleStepClick}
                viewingStep={displayStepIndex}
                compact={true}
              />
            </div>
          </div>
          
          {/* Right: Back to Current Step Button */}
          <div className="flex-shrink-0">
            {viewingStep !== null && viewingStep !== currentStepIndex && (
              <button
                onClick={() => setViewingStep(null)}
                className="px-3 py-1.5 rounded-lg bg-mission-status-assigned/20 border border-mission-status-assigned/40 text-mission-status-assigned text-xs font-semibold hover:bg-mission-status-assigned/30 transition-all flex items-center gap-1.5"
                title="Quay lại bước hiện tại"
              >
                <span className="hidden lg:inline">Bước hiện tại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Flex-1 */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col overflow-hidden">
        {/* Render step based on displayStepIndex - Flex-1 container */}
        <div className="flex-1 overflow-hidden">
          {displayStepIndex === 0 && (
            <AssignedStepView
              mission={mission}
              missionRequests={missionRequests}
              onAccept={handleAccept}
              onReject={handleReject}
              loading={actionLoading === "accept" || actionLoading === "reject"}
              disabled={viewingStep !== null && viewingStep !== currentStepIndex}
            />
          )}

          {displayStepIndex === 1 && (
            <ClaimStepView
              timeline={timeline}
              mission={mission}
              missionRequests={missionRequests}
              onConfirmClaim={handleConfirmClaim}
              loading={actionLoading === "confirm_claim"}
              disabled={viewingStep !== null && viewingStep !== currentStepIndex}
            />
          )}

          {displayStepIndex === 2 && (
            <EnRouteStepView
              missionRequests={missionRequests}
              onArrived={handleArrived}
              loading={actionLoading === "arrive"}
              disabled={viewingStep !== null && viewingStep !== currentStepIndex}
            />
          )}

          {displayStepIndex === 3 && (
            <InProgressStepView
              missionRequests={missionRequests}
              teamRequests={teamRequests}
              onUpdateProgress={handleUpdateProgress}
              onCompleteRequest={handleCompleteRequest}
              onCompleteMission={handleCompleteMission}
              loading={actionLoading}
              disabled={viewingStep !== null && viewingStep !== currentStepIndex}
            />
          )}

          {displayStepIndex === 4 && (
            <CompletedStepView
              timeline={timeline}
              mission={mission}
              missionRequests={missionRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
}
