"use client";

import { useRouter } from "next/navigation";
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaFileAlt } from "react-icons/fa";
import GoongTeamMissionMap from "@/modules/map/presentation/components/GoongTeamMissionMap";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";

interface CompletedStepViewProps {
  timeline: Timeline;
  mission: Mission;
  missionRequests: MissionRequest[];
}

export default function CompletedStepView({
  timeline,
  mission,
  missionRequests,
}: CompletedStepViewProps) {
  const router = useRouter();

  // Calculate statistics
  const totalRequests = missionRequests.length;
  const completedRequests = missionRequests.filter(mr => 
    mr.status === "CLOSED" || mr.status === "FULFILLED"
  ).length;
  const partialRequests = missionRequests.filter(mr => 
    mr.status === "PARTIAL"
  ).length;
  const failedRequests = totalRequests - completedRequests - partialRequests;

  const totalPeopleNeeded = missionRequests.reduce((sum, mr) => {
    const peopleNeeded = (mr as any).requestPeopleSnapshot || (mr as any).peopleNeeded || 0;
    return sum + peopleNeeded;
  }, 0);

  const totalPeopleRescued = missionRequests.reduce((sum, mr) => {
    return sum + (mr.peopleRescued || 0);
  }, 0);

  const totalSuppliesNeeded = missionRequests.reduce((sum, mr) => {
    const supplies = (mr as any).requestSuppliesSnapshot || [];
    return sum + supplies.length;
  }, 0);

  const totalSuppliesDelivered = missionRequests.reduce((sum, mr) => {
    const supplies = (mr as any).requestSuppliesSnapshot || [];
    return sum + supplies.filter((s: any) => (s.deliveredQty || 0) > 0).length;
  }, 0);

  // Success icon based on timeline status
  const getStatusIcon = () => {
    if (timeline.status === "COMPLETED") {
      return <FaCheckCircle className="text-green-400 text-6xl" />;
    } else if (timeline.status === "PARTIAL") {
      return <FaExclamationTriangle className="text-yellow-400 text-6xl" />;
    } else {
      return <FaTimes className="text-red-400 text-6xl" />;
    }
  };

  const getStatusText = () => {
    if (timeline.status === "COMPLETED") {
      return { title: "Hoàn thành xuất sắc!", color: "text-green-400" };
    } else if (timeline.status === "PARTIAL") {
      return { title: "Hoàn thành một phần", color: "text-yellow-400" };
    } else if (timeline.status === "WITHDRAWN") {
      return { title: "Đã rút lui", color: "text-gray-400" };
    } else {
      return { title: "Thất bại", color: "text-red-400" };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="h-full flex flex-col">
      {/* Hero Summary - Fixed */}
      <div className="flex-shrink-0 bg-white/10 border border-white/20 rounded-2xl p-4 text-center space-y-2 mb-4">
        <div className="flex justify-center">
          {getStatusIcon()}
        </div>
        <h2 className={`text-3xl font-bold ${statusInfo.color}`}>
          {statusInfo.title}
        </h2>
        
        {/* Big Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/60">Người được cứu</p>
            <p className="text-3xl font-bold text-white mt-1">
              {totalPeopleRescued} <span className="text-lg text-white/60">/ {totalPeopleNeeded}</span>
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/60">Vật tư phát</p>
            <p className="text-3xl font-bold text-white mt-1">
              {totalSuppliesDelivered} <span className="text-lg text-white/60">/ {totalSuppliesNeeded}</span>
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/60">Tổng yêu cầu</p>
            <p className="text-3xl font-bold text-white mt-1">{totalRequests}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Flex-1 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* Map Summary - 60% */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <GoongTeamMissionMap
            step="completed"
            missionRequests={missionRequests}
            className="h-full"
          />
        </div>

        {/* Results Panel - 40% - Scrollable */}
        <div className="lg:col-span-2 h-full overflow-y-auto scrollbar-hide pr-2 space-y-4">
          {/* Request Results */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Kết quả từng yêu cầu</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {missionRequests.map((mr) => {
                const requestId = typeof mr.requestId === "string" 
                  ? mr.requestId 
                  : (mr.requestId as any)?._id;
                const peopleNeeded = (mr as any).requestPeopleSnapshot || (mr as any).peopleNeeded || 0;
                const peopleRescued = mr.peopleRescued || 0;
                const progressPercent = peopleNeeded > 0 
                  ? Math.round((peopleRescued / peopleNeeded) * 100) 
                  : 0;
                
                const isCompleted = mr.status === "CLOSED" || mr.status === "FULFILLED";
                const isPartial = mr.status === "PARTIAL";
                const isFailed = !isCompleted && !isPartial;

                return (
                  <div key={mr._id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-white/70 flex-shrink-0">
                      REQ-{requestId?.slice(-6)}
                    </span>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCompleted ? "bg-green-500" :
                          isPartial ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-white/80 flex-shrink-0">{progressPercent}%</span>
                    {isCompleted && <FaCheckCircle className="text-green-400" />}
                    {isPartial && <FaExclamationTriangle className="text-yellow-400" />}
                    {isFailed && <FaTimes className="text-red-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Contribution */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Đóng góp của đội</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Người được cứu</span>
                <span className="text-white font-semibold">{totalPeopleRescued}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Vật tư phát</span>
                <span className="text-white font-semibold">{totalSuppliesDelivered}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Yêu cầu hoàn thành</span>
                <span className="text-white font-semibold">{completedRequests}</span>
              </div>
            </div>
          </div>

          {/* Issues (if any) */}
          {(failedRequests > 0 || partialRequests > 0) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-yellow-300 flex items-center gap-2">
                <FaExclamationTriangle />
                Vấn đề cần lưu ý
              </h3>
              <div className="space-y-2 text-sm">
                {failedRequests > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-300">Yêu cầu thất bại</span>
                    <span className="text-red-300 font-semibold">{failedRequests}</span>
                  </div>
                )}
                {partialRequests > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-300">Hoàn thành một phần</span>
                    <span className="text-yellow-300 font-semibold">{partialRequests}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => router.push("/report")}
            className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaFileAlt />
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
