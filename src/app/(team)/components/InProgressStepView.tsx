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
    peopleIncrement: number;
    suppliesIncrement: number;
  }>>({});

  // Initialize progress data
  useEffect(() => {
    const initialData: typeof progressData = {};
    missionRequests.forEach(mr => {
      initialData[mr._id] = { peopleIncrement: 0, suppliesIncrement: 0 };
    });
    setProgressData(initialData);
  }, [missionRequests]);

  // Map MissionRequest to TeamRequest
  const getTeamRequestForMissionRequest = (missionRequestId: string) => {
    return teamRequests.find(tr => {
      const trMrId = typeof tr.missionRequestId === "string"
        ? tr.missionRequestId
        : (tr.missionRequestId as any)?._id;
      return trMrId === missionRequestId;
    });
  };

  // Calculate completed requests
  const completedCount = teamRequests.filter(tr => tr.completedAt != null).length;
  const totalCount = missionRequests.length;

  const handleUpdateProgress = async (missionRequestId: string) => {
    const mr = missionRequests.find(m => m._id === missionRequestId);
    if (!mr) return;

    const data = progressData[missionRequestId];
    if (!data) return;

    const peopleRescuedIncrement = data.peopleIncrement;
    const suppliesSnapshot = (mr as any).requestSuppliesSnapshot || [];
    const suppliesDelivered: { supplyId: string; quantityDelivered: number }[] = [];
    
    // Calculate supplies increment proportionally
    if (data.suppliesIncrement > 0 && suppliesSnapshot.length > 0) {
      suppliesSnapshot.forEach((item: any) => {
        const supplyId = item.supplyId?._id || item.supplyId;
        const requested = item.requestedQty || 0;
        const delivered = item.deliveredQty || 0;
        const remaining = requested - delivered;
        
        if (remaining > 0 && supplyId) {
          // Distribute increment proportionally based on remaining amount
          const totalRemaining = suppliesSnapshot.reduce((sum: number, s: any) => {
            const req = s.requestedQty || 0;
            const del = s.deliveredQty || 0;
            return sum + (req - del);
          }, 0);
          
          const proportion = remaining / totalRemaining;
          const qty = Math.min(data.suppliesIncrement * proportion, remaining);
          
          if (qty > 0) {
            suppliesDelivered.push({ supplyId, quantityDelivered: qty });
          }
        }
      });
    }

    if (peopleRescuedIncrement <= 0 && suppliesDelivered.length === 0) {
      alert("Vui lòng tăng số người hoặc vật tư cần cập nhật");
      return;
    }

    await onUpdateProgress(missionRequestId, {
      peopleRescuedIncrement: peopleRescuedIncrement > 0 ? peopleRescuedIncrement : undefined,
      suppliesDelivered: suppliesDelivered.length > 0 ? suppliesDelivered : undefined,
    });

    // Reset increments
    setProgressData(prev => ({
      ...prev,
      [missionRequestId]: {
        peopleIncrement: 0,
        suppliesIncrement: 0,
      },
    }));

    // Check if request is now fully completed and auto-complete it
    const peopleNeeded = (mr as any).requestPeopleSnapshot || (mr as any).peopleNeeded || 0;
    const newPeopleRescued = (mr.peopleRescued || 0) + peopleRescuedIncrement;
    
    const totalSuppliesRequested = suppliesSnapshot.reduce((sum: number, item: any) => sum + (item.requestedQty || 0), 0);
    const totalSuppliesDelivered = suppliesSnapshot.reduce((sum: number, item: any) => sum + (item.deliveredQty || 0), 0);
    const newTotalSuppliesDelivered = totalSuppliesDelivered + data.suppliesIncrement;
    
    const isPeopleComplete = peopleNeeded === 0 || newPeopleRescued >= peopleNeeded;
    const isSuppliesComplete = totalSuppliesRequested === 0 || newTotalSuppliesDelivered >= totalSuppliesRequested;
    
    if (isPeopleComplete && isSuppliesComplete) {
      // Auto-complete the request
      const teamRequest = getTeamRequestForMissionRequest(missionRequestId);
      if (teamRequest && !teamRequest.completedAt) {
        await onCompleteRequest(teamRequest._id);
      }
    }
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
    
    // Calculate total supplies
    const totalSuppliesRequested = suppliesSnapshot.reduce((sum: number, item: any) => sum + (item.requestedQty || 0), 0);
    const totalSuppliesDelivered = suppliesSnapshot.reduce((sum: number, item: any) => sum + (item.deliveredQty || 0), 0);

    const borderColor = priority === "Critical" || priority === "High" 
      ? "border-mission-status-critical" 
      : priority === "Normal" 
      ? "border-mission-status-warning"
      : "border-blue-500";
    
    const dotColor = priority === "Critical" || priority === "High" 
      ? "text-mission-status-critical" 
      : priority === "Normal" 
      ? "text-mission-status-warning"
      : "text-blue-500";
    
    const currentPeopleIncrement = progressData[mr._id]?.peopleIncrement || 0;
    const currentSuppliesIncrement = progressData[mr._id]?.suppliesIncrement || 0;

    return (
      <div
        key={mr._id}
        className={`bg-mission-bg-secondary border-2 ${borderColor} rounded-lg p-4 space-y-3 transition-all duration-300 ${
          isCompleted ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`${dotColor} text-lg`}>●</span>
            <span className="text-sm font-bold text-mission-text-primary">
              REQ-{requestId?.slice(-4)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateProgress(mr._id)}
              disabled={loading === `progress_${mr._id}` || isCompleted}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/40 text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {loading === `progress_${mr._id}` ? "..." : "Cập nhật"}
            </button>
            <button
              onClick={() => handleCompleteRequest(mr._id)}
              disabled={loading === `complete_${mr._id}` || isCompleted}
              className="px-3 py-1.5 rounded-lg bg-mission-status-completed/20 text-mission-status-completed hover:bg-mission-status-completed/30 border border-mission-status-completed/40 text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {loading === `complete_${mr._id}` ? "..." : "Hoàn thành"}
            </button>
          </div>
        </div>

        {/* Progress Controls - Compact Layout */}
        {!isCompleted && (
          <div className="flex items-center justify-between gap-4">
            {/* People Counter */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">👥</span>
              <span className="text-sm font-medium text-mission-text-primary min-w-[50px]">
                {peopleRescued + currentPeopleIncrement}/{peopleNeeded}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setProgressData(prev => ({
                      ...prev,
                      [mr._id]: {
                        ...prev[mr._id],
                        peopleIncrement: Math.max(0, (prev[mr._id]?.peopleIncrement || 0) - 1),
                      },
                    }));
                  }}
                  disabled={currentPeopleIncrement <= 0 || isCompleted}
                  className="w-8 h-8 rounded-lg bg-mission-bg-tertiary hover:bg-mission-bg-tertiary/80 border border-mission-border text-mission-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                >
                  −
                </button>
                <button
                  onClick={() => {
                    const remaining = peopleNeeded - peopleRescued;
                    setProgressData(prev => ({
                      ...prev,
                      [mr._id]: {
                        ...prev[mr._id],
                        peopleIncrement: Math.min(remaining, (prev[mr._id]?.peopleIncrement || 0) + 1),
                      },
                    }));
                  }}
                  disabled={peopleRescued + currentPeopleIncrement >= peopleNeeded || isCompleted}
                  className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Supplies Counter */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">📦</span>
              <span className="text-sm font-medium text-mission-text-primary min-w-[50px]">
                {Math.round(totalSuppliesDelivered + currentSuppliesIncrement)}/{totalSuppliesRequested}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setProgressData(prev => ({
                      ...prev,
                      [mr._id]: {
                        ...prev[mr._id],
                        suppliesIncrement: Math.max(0, (prev[mr._id]?.suppliesIncrement || 0) - 1),
                      },
                    }));
                  }}
                  disabled={currentSuppliesIncrement <= 0 || isCompleted}
                  className="w-8 h-8 rounded-lg bg-mission-bg-tertiary hover:bg-mission-bg-tertiary/80 border border-mission-border text-mission-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                >
                  −
                </button>
                <button
                  onClick={() => {
                    const remaining = totalSuppliesRequested - totalSuppliesDelivered;
                    setProgressData(prev => ({
                      ...prev,
                      [mr._id]: {
                        ...prev[mr._id],
                        suppliesIncrement: Math.min(remaining, (prev[mr._id]?.suppliesIncrement || 0) + 1),
                      },
                    }));
                  }}
                  disabled={totalSuppliesDelivered + currentSuppliesIncrement >= totalSuppliesRequested || isCompleted}
                  className="w-8 h-8 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                >
                  +
                </button>
              </div>
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
      <div className="lg:col-span-2 flex flex-col">
        {/* Container Card */}
        <div className="bg-mission-bg-secondary border border-mission-border-subtle rounded-xl p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-mission-border-subtle">
            <h2 className="text-lg font-bold text-mission-text-primary uppercase tracking-wide">
              ACTIVE REQUESTS
            </h2>
            <div className="px-3 py-1.5 rounded-lg bg-mission-status-completed/20 border border-mission-status-completed/40">
              <span className="text-sm font-bold text-mission-status-completed">
                {completedCount} / {totalCount} Done
              </span>
            </div>
          </div>

          {/* Request Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {/* Sort: incomplete requests first, completed requests last */}
            {missionRequests
              .sort((a, b) => {
                const aCompleted = getTeamRequestForMissionRequest(a._id)?.completedAt != null;
                const bCompleted = getTeamRequestForMissionRequest(b._id)?.completedAt != null;
                if (aCompleted === bCompleted) return 0;
                return aCompleted ? 1 : -1;
              })
              .map(renderRequestCard)}
            
            {missionRequests.length === 0 && (
              <div className="text-center text-mission-text-muted py-8">
                Chưa có yêu cầu nào trong nhiệm vụ này
              </div>
            )}
          </div>

          {/* Complete Mission Button */}
          <div className="pt-3 border-t border-mission-border-subtle">
            <button
              onClick={onCompleteMission}
              disabled={loading === "complete_mission"}
              className="w-full px-6 py-3 rounded-lg bg-mission-status-completed/20 hover:bg-mission-status-completed/30 disabled:opacity-50 disabled:cursor-not-allowed text-mission-status-completed border border-mission-status-completed/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading === "complete_mission" ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                  Đang hoàn tất...
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-base" />
                  Complete All Requests to Finish
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
