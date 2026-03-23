"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GetMissionDetailUseCase } from "../../application/getMissionDetail.usecase";
import { AddRequestsToMissionUseCase } from "../../application/addRequestsToMission.usecase";
import { RemoveRequestFromMissionUseCase } from "../../application/removeRequestFromMission.usecase";
import { AddTeamsToMissionUseCase } from "../../application/addTeamsToMission.usecase";
import { RemoveTeamFromMissionUseCase } from "../../application/removeTeamFromMission.usecase";
import { StartMissionUseCase } from "../../application/startMission.usecase";
import { GetMissionRequestsUseCase } from "../../application/getMissionRequests.usecase";
import { PauseMissionUseCase } from "../../application/pauseMission.usecase";
import { ResumeMissionUseCase } from "../../application/resumeMission.usecase";
import { AbortMissionUseCase } from "../../application/abortMission.usecase";
import { GetTimelinesUseCase } from "@/modules/timelines/application/getTimelines.usecase";
import { missionRepository } from "../../infrastructure/mission.repository.impl";
import { timelineRepository } from "@/modules/timelines/infrastructure/timeline.repository.impl";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { requestsApi } from "@/modules/requests/infrastructure/requests.api";
import AddRequestsModal from "../components/AddRequestsModal";
import AddTeamsModal from "../components/AddTeamsModal";
import type { Mission, RescueTeam } from "../../domain/mission.entity";
import type { MissionRequest } from "../../domain/missionRequest.entity";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import { useToast } from "@/hooks/use-toast";
import { missionRequestApi } from "../../infrastructure/missionRequest.api";
import { useNotificationStore } from "@/store/useNotification.store";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

// Dynamic import cho GoongMissionMap để tránh SSR issues
const GoongMissionMap = dynamic(
  () => import("@/modules/map/presentation/components/GoongMissionMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  },
);

// ─── Use Cases ────────────────────────────────────────────

const getMissionDetailUseCase = new GetMissionDetailUseCase(missionRepository);
const addRequestsUseCase = new AddRequestsToMissionUseCase(missionRepository);
const removeRequestUseCase = new RemoveRequestFromMissionUseCase(missionRepository);
const addTeamsUseCase = new AddTeamsToMissionUseCase(missionRepository);
const removeTeamUseCase = new RemoveTeamFromMissionUseCase(missionRepository);
const startMissionUseCase = new StartMissionUseCase(missionRepository);
const getMissionRequestsUseCase = new GetMissionRequestsUseCase(missionRepository);
const pauseMissionUseCase = new PauseMissionUseCase(missionRepository);
const resumeMissionUseCase = new ResumeMissionUseCase(missionRepository);
const abortMissionUseCase = new AbortMissionUseCase(missionRepository);
const getTimelinesUseCase = new GetTimelinesUseCase(timelineRepository);

// ─── Constants ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  PAUSED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  PARTIAL: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
  ABORTED: "bg-red-500/20 text-red-300 border-red-500/30",
};

const TIMELINE_STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-blue-500/20 text-blue-300",
  EN_ROUTE: "bg-cyan-500/20 text-cyan-300",
  ON_SITE: "bg-yellow-500/20 text-yellow-300",
  COMPLETED: "bg-green-500/20 text-green-300",
  PARTIAL: "bg-purple-500/20 text-purple-300",
  FAILED: "bg-red-500/20 text-red-300",
  WITHDRAWN: "bg-gray-500/20 text-gray-300",
  CANCELLED: "bg-red-500/20 text-red-400",
};

const TIMELINE_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "📋 Đã phân công",
  EN_ROUTE: "🚗 Đang di chuyển",
  ON_SITE: "📍 Tại hiện trường",
  COMPLETED: "✅ Hoàn thành",
  PARTIAL: "⚠️ Hoàn thành một phần",
  FAILED: "❌ Thất bại",
  WITHDRAWN: "🔙 Đã rút",
  CANCELLED: "🚫 Đã hủy",
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-500/20 text-gray-300",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300",
  PARTIAL: "bg-purple-500/20 text-purple-300",
  FULFILLED: "bg-green-500/20 text-green-300",
  CLOSED: "bg-gray-500/20 text-gray-500",
  DROPPED: "bg-red-500/20 text-red-500",
};

// ─── Component ────────────────────────────────────────────

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params?.id as string;
  const { toast } = useToast();

  // Debug log
  useEffect(() => {
    console.log("🔍 MissionDetailPage params:", params);
    console.log("🔍 Extracted missionId:", missionId);
  }, [params, missionId]);

  const [mission, setMission] = useState<Mission | null>(null);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [verifiedRequests, setVerifiedRequests] = useState<CoordinatorRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [requestsWithLocation, setRequestsWithLocation] = useState<CoordinatorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showAddRequestsModal, setShowAddRequestsModal] = useState(false);
  const [showAddTeamsModal, setShowAddTeamsModal] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  // Notifications for auto-refresh
  const notifications = useNotificationStore(state => state.notifications);

  const fetchData = useCallback(async () => {
    if (!missionId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch mission detail first
      const missionData = await getMissionDetailUseCase.execute(missionId);
      setMission(missionData);
      
      // Then fetch timelines, requests, and warehouses in parallel
      const [timelinesData, requestsData, warehouseData] = await Promise.all([
        getTimelinesUseCase.execute({ missionId }),
        getMissionRequestsUseCase.execute(missionId),
        warehouseRepository.getWarehouses(),
      ]);
      setTimelines(timelinesData.data || []);
      setMissionRequests(requestsData || []);
      setWarehouses(warehouseData.warehouses || []);
      
      // Fetch full request details for those in the mission
      const requestIds = (requestsData || []).map(mr => 
        typeof mr.requestId === "object" ? (mr.requestId as any)?._id : mr.requestId
      ).filter(Boolean);
      
      if (requestIds.length > 0) {
        const requestDetailsPromises = requestIds.map(id => 
          requestRepository.getRequestDetail(id).catch(() => null)
        );
        const requestDetails = await Promise.all(requestDetailsPromises);
        setRequestsWithLocation(requestDetails.filter(Boolean) as CoordinatorRequest[]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to fetch mission:", error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [missionId]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh on websocket notifications for this mission
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.missionId === missionId) {
        fetchData();
      }
    }
  }, [notifications, missionId, fetchData]);

  const loadAssignData = async () => {
    try {
      // Load verified requests
      const reqRes = await requestsApi.getAllRequests({ status: "VERIFIED" });
      const availableRequests = (reqRes as any).data || [];

      // We need to fetch ALL active mission-requests in other missions to remove them from `availableRequests`
      const activeMissionReqsRes = await missionRequestApi.getAll({
        status: "PENDING,IN_PROGRESS",
        limit: 1000, 
      });
      const allActiveMr = (activeMissionReqsRes as any).data || [];
      const busyRequestIds = new Set(
        allActiveMr.map((mr: any) => typeof mr.requestId === "object" ? mr.requestId?._id : mr.requestId)
      );

      // Now filter out those that are currently PENDING/IN_PROGRESS in ANY mission
      let filteredReqs = availableRequests.filter((r: CoordinatorRequest) => !busyRequestIds.has(r._id));
      setVerifiedRequests(filteredReqs);

      // Load teams that are actually AVAILABLE
      const teamRes = await missionRepository.getTeams({ status: "AVAILABLE" });
      const availableTeams = teamRes || [];

      // Even if team is AVAILABLE, maybe they are already planned in this mission
      // So let's filter them out purely from current `timelines` array
      const plannedTeamIds = new Set(
        timelines.map(t => typeof t.teamId === "object" ? (t.teamId as any)?._id : t.teamId)
      );
      
      const filteredTeams = availableTeams.filter((t: RescueTeam) => !plannedTeamIds.has(t._id));
      setTeams(filteredTeams);

    } catch (error: any) {
      console.error("Failed to load assign data:", error);
    }
  };

  const openAddRequestsModal = async () => {
    await loadAssignData();
    setShowAddRequestsModal(true);
  };
  
  const openAddTeamsModal = async () => {
    await loadAssignData();
    setShowAddTeamsModal(true);
  };

  const handleAddRequests = async (requestIds: string[], note?: string) => {
    try {
      await addRequestsUseCase.execute(missionId, { requestIds, note });
      toast({ title: "✅ Đã thêm yêu cầu thành công" });
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Thêm yêu cầu thất bại",
      });
      throw error;
    }
  };

  const handleAddTeams = async (teamIds: string[], note?: string) => {
    try {
      await addTeamsUseCase.execute(missionId, { teamIds, note });
      toast({ title: "✅ Đã thêm đội thành công" });
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Thêm đội thất bại",
      });
      throw error;
    }
  };

  const handleRemoveRequest = async (mr: MissionRequest) => {
    const reqIdStr = typeof mr.requestId === "object" ? (mr.requestId as any)?._id : mr.requestId;
    if (!reqIdStr) return;

    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu này khỏi nhiệm vụ?")) return;
    setActionLoading(true);
    try {
      await removeRequestUseCase.execute(missionId, reqIdStr);
      toast({ title: "🗑 Đã xóa yêu cầu" });
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Xóa yêu cầu thất bại",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTeam = async (timeline: Timeline) => {
    const teamIdStr = typeof timeline.teamId === "string" ? timeline.teamId : (timeline.teamId as any)?._id || timeline.teamId;
    if (!teamIdStr) return;

    if (!confirm("Bạn có chắc chắn muốn xóa đội này khỏi nhiệm vụ?")) return;
    setActionLoading(true);
    try {
      await removeTeamUseCase.execute(missionId, teamIdStr);
      toast({ title: "🗑 Đã xóa đội khỏi phân công" });
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Xóa đội thất bại",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartMission = async () => {
    setActionLoading(true);
    try {
      await startMissionUseCase.execute(missionId);
      toast({ title: "🚀 Nhiệm vụ đã bắt đầu" });
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Bắt đầu nhiệm vụ thất bại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const updated = await pauseMissionUseCase.execute(missionId);
      setMission(updated);
      toast({ title: "⏸️ Đã tạm dừng nhiệm vụ" });
    } catch (error) {
      console.error("Failed to pause:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tạm dừng thất bại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const updated = await resumeMissionUseCase.execute(missionId);
      setMission(updated);
      toast({ title: "▶️ Đã tiếp tục nhiệm vụ" });
    } catch (error) {
      console.error("Failed to resume:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tiếp tục thất bại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbort = async () => {
    setActionLoading(true);
    try {
      const updated = await abortMissionUseCase.execute(missionId);
      setMission(updated);
      setShowAbortConfirm(false);
      toast({ title: "🚫 Đã hủy nhiệm vụ" });
      await fetchData();
    } catch (error) {
      console.error("Failed to abort:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Hủy nhiệm vụ thất bại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="p-6 text-center">
        <p className="text-4xl mb-4">❓</p>
        {error ? (
          <>
            <p className="text-red-400 font-bold mb-2">Lỗi tải nhiệm vụ</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <p className="text-gray-500 text-xs mb-4">ID: {missionId}</p>
          </>
        ) : (
          <p className="text-gray-400">Không tìm thấy nhiệm vụ</p>
        )}
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const isActive = ["PLANNED", "IN_PROGRESS", "PAUSED", "DRAFT", "PARTIAL"].includes(
    mission.status,
  );
  
  const isDraft = mission.status === "DRAFT";
  const canStart = isDraft && missionRequests.length > 0 && timelines.length > 0;
  
  const canPause = mission.status === "IN_PROGRESS";
  const canResume = mission.status === "PAUSED";
  const canAbort = ["PLANNED", "IN_PROGRESS", "PAUSED", "DRAFT"].includes(mission.status);

  return (
    <div className="p-4 lg:p-6 relative z-10">
      {/* Back */}
      <button
        onClick={() => router.push("/mission-control")}
        className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
      >
        ← Danh sách nhiệm vụ
      </button>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-gray-400">
                {mission.code}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full border font-medium ${
                  STATUS_COLORS[mission.status] || ""
                }`}
              >
                {mission.status}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">
                {mission.type === "RESCUE" ? "🚨 Cứu hộ" : "📦 Cứu trợ"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{mission.name}</h1>
            {mission.description && (
              <p className="text-gray-400 mt-2">{mission.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>
                Ưu tiên:{" "}
                <strong className="text-gray-300">{mission.priority}</strong>
              </span>
              <span>
                Tạo: {new Date(mission.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isActive && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {isDraft && (
                <>
                  <button
                    onClick={handleStartMission}
                    title={!canStart ? "Cần ít nhất 1 Request và 1 Team để bắt đầu" : "Bắt đầu nhiệm vụ"}
                    disabled={!canStart || actionLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors text-sm"
                  >
                    🚀 Bắt đầu nhiệm vụ
                  </button>
                </>
              )}
              {canPause && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ⏸️ Tạm dừng
                </button>
              )}
              {canResume && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ▶️ Tiếp tục
                </button>
              )}
              {canAbort && (
                <button
                  onClick={() => setShowAbortConfirm(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  🚫 Hủy bỏ
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mission Dashboard Map */}
      {requestsWithLocation.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🗺️ Bản đồ tổng quan nhiệm vụ</h2>
          <GoongMissionMap
            requests={requestsWithLocation}
            warehouses={warehouses}
            onRequestClick={(request) => {
              router.push(`/requests/${request._id}`);
            }}
            height="600px"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">📋 Mission Requests</h2>
            <div className="flex items-center gap-3">
              {isDraft && (
                <button
                  onClick={openAddRequestsModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-1"
                >
                  ➕ Thêm Request
                </button>
              )}
              <span className="text-sm text-gray-400">
                {missionRequests.length} request(s)
              </span>
            </div>
          </div>

          {missionRequests.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border border-dashed border-white/10 rounded-xl">
              <p className="text-3xl mb-2">📋</p>
              <p>Chưa có yêu cầu nào.</p>
              {isDraft && <p className="text-sm mt-1">Hãy thêm Request để bắt đầu.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {missionRequests.map((mr) => (
                <div key={mr._id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${REQUEST_STATUS_COLORS[mr.status] || ''}`}>
                          {mr.status}
                        </span>
                      </div>
                      <p className="text-gray-300 font-mono text-xs">
                        Request ID: {typeof mr.requestId === "object" ? (mr.requestId as any)?._id : mr.requestId}
                      </p>
                      <div className="mt-2 text-sm text-gray-400">
                        Tiến độ cứu hộ: {mr.peopleRescued || 0} / {mr.requestPeopleSnapshot || 0} người
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1 mt-1">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${mr.fulfillmentPercent || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                    {isDraft && (
                      <button
                        onClick={() => handleRemoveRequest(mr)}
                        disabled={actionLoading}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        title="Xóa yêu cầu khỏi nhiệm vụ"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timelines Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">📊 Timelines</h2>
            <div className="flex items-center gap-3">
              {isDraft && (
                <button
                  onClick={openAddTeamsModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-1"
                >
                  👥 Thêm Đội
                </button>
              )}
              <span className="text-sm text-gray-400">
                {timelines.length} timeline(s)
              </span>
            </div>
          </div>

        {timelines.length === 0 ?
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Chưa có timeline nào. Hãy phân công đội!</p>
          </div>
        : <div className="space-y-3">
            {timelines.map((tl) => (
              <div
                key={tl._id}
                className="bg-white/5 border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          TIMELINE_STATUS_COLORS[tl.status] || ""
                        }`}
                      >
                        {TIMELINE_STATUS_LABELS[tl.status] || tl.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Team</span>
                        <p className="text-gray-300 font-mono text-xs">
                          {typeof tl.teamId === "string" ?
                            tl.teamId
                          : (
                              tl.teamId as unknown as {
                                name?: string;
                                _id: string;
                              }
                            )?.name ||
                            (tl.teamId as unknown as { _id: string })?._id
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">
                          Phân công lúc
                        </span>
                        <p className="text-gray-300 text-xs">
                          {tl.assignedAt ?
                            new Date(tl.assignedAt).toLocaleString("vi-VN")
                          : (tl.createdAt ? new Date(tl.createdAt).toLocaleString("vi-VN") : "—")}
                        </p>
                      </div>
                    </div>
                    {tl.note && (
                      <p className="text-gray-400 text-xs mt-2 italic">
                        📝 {tl.note}
                      </p>
                    )}
                    {tl.failureReason && (
                      <p className="text-red-400 text-xs mt-1">
                        ❌ {tl.failureReason}
                      </p>
                    )}
                    {missionRequests && missionRequests.length > 0 && missionRequests.reduce((sum, mr) => sum + (mr.peopleRescued || 0), 0) > 0 && (
                      <p className="text-green-400 text-xs mt-1">
                        🙋 Đã cứu: {missionRequests.reduce((sum, mr) => sum + (mr.peopleRescued || 0), 0)} người
                      </p>
                    )}
                  </div>
                  {isDraft && (
                    <button
                      onClick={() => handleRemoveTeam(tl)}
                      disabled={actionLoading}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Xóa đội khỏi nhiệm vụ"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        }
      </div></div>

      {showAddRequestsModal && (
        <AddRequestsModal
          isOpen={showAddRequestsModal}
          onClose={() => setShowAddRequestsModal(false)}
          onAdd={handleAddRequests}
          requests={verifiedRequests}
        />
      )}

      <AddTeamsModal
        isOpen={showAddTeamsModal}
        onClose={() => setShowAddTeamsModal(false)}
        onAdd={handleAddTeams}
        teams={teams}
      />

      {/* Abort Confirmation */}
      {showAbortConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a3a52] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h3 className="text-lg font-bold text-white mb-2">
              Hủy bỏ nhiệm vụ?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Tất cả timelines đang hoạt động sẽ bị hủy. Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAbortConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg"
              >
                Quay lại
              </button>
              <button
                onClick={handleAbort}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg"
              >
                {actionLoading ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
