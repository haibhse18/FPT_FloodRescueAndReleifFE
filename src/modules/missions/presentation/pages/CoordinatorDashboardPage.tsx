"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { missionRepository } from "@/modules/missions/infrastructure/mission.repository.impl";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import type { Mission } from "@/modules/missions/domain/mission.entity";

// ─── Component ────────────────────────────────────────────

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const [submittedCount, setSubmittedCount] = useState(0);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<CoordinatorRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [submitted, active, urgent] = await Promise.all([
          requestRepository.getAllRequests({ status: "SUBMITTED", limit: 1 }),
          missionRepository.getMissions({ status: "IN_PROGRESS", limit: 5 }),
          requestRepository.getAllRequests({ status: "SUBMITTED", limit: 5 }),
        ]);
        setSubmittedCount(submitted.total || 0);
        setActiveMissions(active.data || []);
        setUrgentRequests(urgent.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 relative z-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">📊 Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Tổng quan hoạt động điều phối
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📩"
          title="Chờ xử lý"
          value={submittedCount}
          color="border-yellow-500/30"
          onClick={() => router.push("/requests?status=SUBMITTED")}
        />
        <StatCard
          icon="🎯"
          title="Mission đang chạy"
          value={activeMissions.length}
          color="border-blue-500/30"
          onClick={() => router.push("/mission-control?status=IN_PROGRESS")}
        />
        <StatCard
          icon="📋"
          title="Cần xử lý"
          value={urgentRequests.length}
          color="border-red-500/30"
          onClick={() => router.push("/requests")}
        />
        <StatCard
          icon="✅"
          title="Hoàn thành hôm nay"
          value="—"
          color="border-green-500/30"
        />
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Requests */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              🆘 Yêu cầu chờ xử lý
            </h2>
            <button
              onClick={() => router.push("/requests")}
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              Xem tất cả →
            </button>
          </div>
          {urgentRequests.length === 0 ?
            <p className="text-gray-500 text-center py-6">
              Không có yêu cầu mới
            </p>
          : <div className="space-y-2">
              {urgentRequests.map((req) => (
                <div
                  key={req._id}
                  onClick={() => router.push(`/requests/${req._id}`)}
                  className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {req.userName || "Ẩn danh"}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {req.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 ml-2 shrink-0">
                      {req.priority || "Normal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Active Missions */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              🎯 Mission đang chạy
            </h2>
            <button
              onClick={() => router.push("/mission-control")}
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              Xem tất cả →
            </button>
          </div>
          {activeMissions.length === 0 ?
            <p className="text-gray-500 text-center py-6">
              Không có mission nào đang chạy
            </p>
          : <div className="space-y-2">
              {activeMissions.map((m) => (
                <div
                  key={m._id}
                  onClick={() => router.push(`/mission-control/${m._id}`)}
                  className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">
                          {m.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                          {m.status}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium truncate mt-1">
                        {m.name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {m.type === "RESCUE" ? "🚨" : "📦"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">⚡ Thao tác nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction
            icon="📩"
            label="Xem requests mới"
            onClick={() => router.push("/requests")}
          />
          <QuickAction
            icon="➕"
            label="Tạo mission"
            onClick={() => router.push("/mission-control")}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function StatCard({
  icon,
  title,
  value,
  color,
  onClick,
}: {
  icon: string;
  title: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-sm border ${color} rounded-xl p-4 ${
        onClick ? "cursor-pointer hover:bg-white/10" : ""
      } transition-colors`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-gray-400 text-xs">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-colors flex items-center gap-2"
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
