"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import MissionMapView from "./MissionMapView";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { TeamRequest } from "@/modules/teamRequests/domain/teamRequest.entity";

interface InProgressStepViewProps {
  missionRequests: MissionRequest[];
  teamRequests: TeamRequest[];
  onUpdateProgress: (missionRequestId: string, data: {
    peopleRescuedIncrement?: number;
    suppliesDelivered?: { supplyId: string; quantityDelivered: number }[];
  }) => Promise<void>;
  onCompleteRequest: (teamRequestId: string, note?: string) => Promise<void>;
  onCompleteMission: () => Promise<void>;
  loading?: string | null;
}

export default function InProgressStepView({
  missionRequests,
  teamRequests,
  onUpdateProgress,
  onCompleteRequest,
  onCompleteMission,
  loading = null,
}: InProgressStepViewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, {
    peopleCount: string;
    supplies: Record<string, string>;
  }>>({});

  // Initialize progress data
  useEffect(() => {
    const initialData: typeof progressData = {};
    missionRequests.forEach(mr => {
      const supplies: Record<string, string> = {};
      const suppliesSnapshot = (mr as any).requestSuppliesSnapshot || [];
      suppliesSnapshot.forEach((item: any) => {
        const supplyId = item.supplyId?._id || item.supplyId;
        if (supplyId) supplies[supplyId] = "";
      });
      initialData[mr._id] = { peopleCount: "", supplies };
    });
    setProgressData(initialData);
  }, [missionRequests]);

  // Map MissionRequest to TeamRequest
  const getTeamRequestForMissionRequest = (missionRequestId: string) => {
    return teamRequests.find(tr => tr.missionRequestId === missionRequestId);
  };

  // Group requests by priority
  const highPriorityRequests = missionRequests.filter(mr => 
    (mr as any).prioritySnapshot === "Critical" || (mr as any).prioritySnapshot === "High"
  );
  const normalPriorityRequests = missionRequests.filter(mr => 
    (mr as any).prioritySnapshot !== "Critical" && (mr as any).prioritySnapshot !== "High"
  );

  const handleUpdateProgress = async (missionRequestId: string) => {
    const data = progressData[missionRequestId];
    if (!data) return;

    const peopleRescuedIncrement = parseInt(data.peopleCount || "0", 10);
    const suppliesDelivered: { supplyId: string; quantityDelivered: number }[] = [];
    
    Object.entries(data.supplies).forEach(([supplyId, value]) => {
      const qty = parseFloat(value || "0");
      if (!isNaN(qty) && qty > 0) {
        suppliesDelivered.push({ supplyId, quantityDelivered: qty });
      }
    });

    if (peopleRescuedIncrement <= 0 && suppliesDelivered.length === 0) {
      alert("Vui lòng nhập số người hoặc vật tư cần cập nhật");
      return;
    }

    await onUpdateProgress(missionRequestId, {
      peopleRescuedIncrement: peopleRescuedIncrement > 0 ? peopleRescuedIncrement : undefined,
      suppliesDelivered: suppliesDelivered.length > 0 ? suppliesDelivered : undefined,
    });

    // Reset form
    setProgressData(prev => ({
      ...prev,
      [missionRequestId]: {
        peopleCount: "",
        supplies: Object.keys(prev[missionRequestId]?.supplies || {}).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {} as Record<string, string>),
      },
    }));
  };

  const handleCompleteRequest = async (missionRequestId: string) => {
    const teamRequest = getTeamRequestForMissionRequest(missionRequestId);
    if (!teamRequest) {
      alert("Không tìm thấy team request tương ứng");
      return;
    }

    if (teamRequest.completedAt) {
      alert("Yêu cầu này đã được hoàn tất");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn hoàn tất yêu cầu này?")) {
      return;
    }

    await onCompleteRequest(teamRequest._id);
  };

  const renderRequestCard = (mr: MissionRequest) => {
    const teamRequest = getTeamRequestForMissionRequest(mr._id);
    const isCompleted = teamRequest?.completedAt != null;
    const priority = (mr as any).prioritySnapshot || "Normal";
    const requestId = typeof mr.requestId === "string" ? mr.requestId : (mr.requestId as any)?._id;
    const peopleNeeded = (mr as any).requestPeopleSnapshot || (mr as any).peopleNeeded || 0;
    const peopleRescued = mr.peopleRescued || 0;
    const suppliesSnapshot = (mr as any).requestSuppliesSnapshot || [];
    const progressPercent = peopleNeeded > 0 ? Math.round((peopleRescued / peopleNeeded) * 100) : 0;

    const borderColor = priority === "Critical" || priority === "High" 
      ? "border-mission-status-critical/60" 
      : "border-mission-status-warning/60";

    return (
      <div
        key={mr._id}
        className={`bg-mission-bg-secondary border-2 ${borderColor} rounded-xl p-4 space-y-3 transition-all ${isCompleted ? "opacity-60" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-mission-text-muted">
              REQ-{requestId?.slice(-6)}
            </span>
            {priority === "Critical" || priority === "High" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-mission-status-critical/20 text-mission-status-critical border border-mission-status-critical/40">
                Ưu tiên cao
              </span>
            ) : null}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isCompleted 
              ? "bg-mission-status-completed/20 text-mission-status-completed border border-mission-status-completed/40"
              : "bg-mission-status-assigned/20 text-mission-status-assigned border border-mission-status-assigned/40"
          }`}>
            {isCompleted ? "Đã hoàn tất" : mr.status}
          </span>
        </div>

        {/* People Progress */}
        <div>
          <div className="flex justify-between text-xs text-mission-text-muted mb-1">
            <span>Người cần cứu</span>
            <span className="text-mission-text-primary font-medium">{peopleRescued} / {peopleNeeded}</span>
          </div>
          <div className="w-full bg-mission-status-pending/20 rounded-full h-2.5">
            <div
              className="bg-mission-status-assigned h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Supplies */}
        {suppliesSnapshot.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-mission-text-muted">Vật tư:</p>
            {suppliesSnapshot.map((item: any) => {
              const supplyId = item.supplyId?._id || item.supplyId;
              const name = item.supplyId?.name || item.name || "Vật tư";
              const unit = item.unit || item.supplyId?.unit || "";
              const requested = item.requestedQty || 0;
              const delivered = item.deliveredQty || 0;
              
              return (
                <div key={supplyId} className="text-xs text-mission-text-secondary flex justify-between">
                  <span>{name}</span>
                  <span className="text-mission-text-primary font-medium">{delivered} / {requested} {unit}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress Inputs */}
        {!isCompleted && (
          <div className="space-y-2 pt-2 border-t border-mission-border-subtle">
            <div className="flex items-center gap-2">
              <label className="text-xs text-mission-text-secondary flex-shrink-0">Số người mới cứu:</label>
              <input
                type="number"
                min={0}
                value={progressData[mr._id]?.peopleCount || ""}
                onChange={(e) => setProgressData(prev => ({
                  ...prev,
                  [mr._id]: { ...prev[mr._id], peopleCount: e.target.value },
                }))}
                className="flex-1 px-3 py-1.5 rounded-lg bg-mission-bg-tertiary border border-mission-border text-xs text-mission-text-primary focus:border-mission-status-assigned focus:outline-none"
                placeholder="0"
              />
            </div>

            {suppliesSnapshot.map((item: any) => {
              const supplyId = item.supplyId?._id || item.supplyId;
              const name = item.supplyId?.name || item.name || "Vật tư";
              const unit = item.unit || item.supplyId?.unit || "";
              
              return (
                <div key={supplyId} className="flex items-center gap-2">
                  <label className="text-xs text-mission-text-secondary flex-shrink-0">{name}:</label>
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={progressData[mr._id]?.supplies?.[supplyId] || ""}
                    onChange={(e) => setProgressData(prev => ({
                      ...prev,
                      [mr._id]: {
                        ...prev[mr._id],
                        supplies: { ...prev[mr._id]?.supplies, [supplyId]: e.target.value },
                      },
                    }))}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-mission-bg-tertiary border border-mission-border text-xs text-mission-text-primary focus:border-mission-status-assigned focus:outline-none"
                    placeholder={`0 ${unit}`}
                  />
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleUpdateProgress(mr._id)}
                disabled={loading === `progress_${mr._id}`}
                className="flex-1 px-3 py-2 rounded-lg bg-mission-action-primary/20 text-mission-action-primary hover:bg-mission-action-primary/30 border border-mission-action-primary/40 text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {loading === `progress_${mr._id}` ? "Đang cập nhật..." : "Cập nhật tiến độ"}
              </button>
              <button
                onClick={() => handleCompleteRequest(mr._id)}
                disabled={loading === `complete_${mr._id}`}
                className="flex-1 px-3 py-2 rounded-lg bg-mission-status-completed/20 text-mission-status-completed hover:bg-mission-status-completed/30 border border-mission-status-completed/40 text-xs font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-1"
              >
                {loading === `complete_${mr._id}` ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaCheckCircle />
                    Hoàn tất
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Map Section - 60% */}
      <div className="lg:col-span-3">
        <MissionMapView
          missionRequests={missionRequests}
          selectedRequestId={selectedRequestId}
          onRequestClick={setSelectedRequestId}
          className="h-[400px] lg:h-full"
        />
      </div>

      {/* Request Cards Section - 40% */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* High Priority */}
          {highPriorityRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-mission-status-critical flex items-center gap-2">
                <FaExclamationTriangle />
                Ưu tiên cao ({highPriorityRequests.length})
              </h3>
              {highPriorityRequests.map(renderRequestCard)}
            </div>
          )}

          {/* Normal Priority */}
          {normalPriorityRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-mission-status-warning flex items-center gap-2">
                Ưu tiên thường ({normalPriorityRequests.length})
              </h3>
              {normalPriorityRequests.map(renderRequestCard)}
            </div>
          )}

          {missionRequests.length === 0 && (
            <div className="text-center text-mission-text-muted py-8">
              Chưa có yêu cầu nào trong nhiệm vụ này
            </div>
          )}
        </div>

        {/* Complete Mission Button */}
        <div className="sticky bottom-0 bg-mission-bg-primary pt-4">
          <button
            onClick={onCompleteMission}
            disabled={loading === "complete_mission"}
            className="w-full px-6 py-4 rounded-xl bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
          >
            {loading === "complete_mission" ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Đang hoàn tất...
              </>
            ) : (
              <>
                <FaCheckCircle className="text-lg" />
                Hoàn tất nhiệm vụ
              </>
            )}
          </button>
          <p className="text-xs text-mission-text-subtle text-center mt-2">
            Hoàn tất nhiệm vụ khi đã xử lý xong tất cả yêu cầu
          </p>
        </div>
      </div>
    </div>
  );
}
