"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GetMissionsUseCase } from "../../application/getMissions.usecase";
import { CreateMissionUseCase } from "../../application/createMission.usecase";
import { missionRepository } from "../../infrastructure/mission.repository.impl";
import type {
  Mission,
  MissionStatus,
  MissionType,
  GetMissionsFilter,
} from "../../domain/mission.entity";
import { useToast } from "@/hooks/use-toast";

// ─── Constants ────────────────────────────────────────────

const STATUS_TABS: { label: string; value: MissionStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "📋 Kế hoạch", value: "PLANNED" },
  { label: "🔄 Đang chạy", value: "IN_PROGRESS" },
  { label: "⏸️ Tạm dừng", value: "PAUSED" },
  { label: "✅ Hoàn thành", value: "COMPLETED" },
  { label: "🚫 Đã hủy", value: "ABORTED" },
];

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  PAUSED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  PARTIAL: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
  ABORTED: "bg-red-500/20 text-red-300 border-red-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-300",
  High: "bg-orange-500/20 text-orange-300",
  Normal: "bg-gray-500/20 text-gray-300",
};

const getMissionsUseCase = new GetMissionsUseCase(missionRepository);
const createMissionUseCase = new CreateMissionUseCase(missionRepository);

// ─── Component ────────────────────────────────────────────

export default function MissionListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MissionStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create mission modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    type: "RESCUE" as MissionType,
    description: "",
    priority: "Normal" as "Critical" | "High" | "Normal",
  });
  const [creating, setCreating] = useState(false);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: GetMissionsFilter = { page, limit: 10 };
      if (activeTab !== "ALL") filters.status = activeTab;
      const result = await getMissionsUseCase.execute(filters);
      setMissions(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleTabChange = (tab: MissionStatus | "ALL") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCreateMission = async () => {
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      const mission = await createMissionUseCase.execute({
        name: createForm.name,
        type: createForm.type,
        description: createForm.description || undefined,
        priority: createForm.priority,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        type: "RESCUE",
        description: "",
        priority: "Normal",
      });
      toast({ title: "✅ Đã tạo nhiệm vụ thành công" });
      router.push(`/mission-control/${mission._id}`);
    } catch (error) {
      console.error("Failed to create mission:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tạo nhiệm vụ thất bại!",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Nhiệm vụ</h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý nhiệm vụ cứu hộ & cứu trợ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Tạo nhiệm vụ
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value ?
                "bg-blue-600 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mission List */}
      {loading ?
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      : missions.length === 0 ?
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">📭</p>
          <p>Không có nhiệm vụ nào</p>
        </div>
      : <div className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission._id}
              onClick={() => router.push(`/mission-control/${mission._id}`)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-400">
                      {mission.code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        STATUS_COLORS[mission.status] || STATUS_COLORS.PLANNED
                      }`}
                    >
                      {mission.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        PRIORITY_COLORS[mission.priority] ||
                        PRIORITY_COLORS.Normal
                      }`}
                    >
                      {mission.priority}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors">
                    {mission.name}
                  </h3>
                  {mission.description && (
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      {mission.description}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4 shrink-0">
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">
                    {mission.type === "RESCUE" ? "🚨 Cứu hộ" : "📦 Cứu trợ"}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(mission.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 disabled:opacity-30 hover:bg-white/10"
          >
            ←
          </button>
          <span className="px-3 py-1.5 text-gray-400 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 disabled:opacity-30 hover:bg-white/10"
          >
            →
          </button>
        </div>
      )}

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Tạo nhiệm vụ mới
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Tên nhiệm vụ *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="VD: Cứu hộ Quận 9 — Lũ quét"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Loại
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        type: e.target.value as MissionType,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="RESCUE" className="bg-gray-800">
                      🚨 Cứu hộ
                    </option>
                    <option value="RELIEF" className="bg-gray-800">
                      📦 Cứu trợ
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Ưu tiên
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        priority: e.target.value as
                          | "Critical"
                          | "High"
                          | "Normal",
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Normal" className="bg-gray-800">
                      Bình thường
                    </option>
                    <option value="High" className="bg-gray-800">
                      Cao
                    </option>
                    <option value="Critical" className="bg-gray-800">
                      Khẩn cấp
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chi tiết nhiệm vụ..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateMission}
                disabled={!createForm.name.trim() || creating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {creating ? "Đang tạo..." : "Tạo nhiệm vụ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
