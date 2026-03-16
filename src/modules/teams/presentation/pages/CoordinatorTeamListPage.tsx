"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";
import type { Team, TeamStatus } from "@/modules/teams/domain/team.entity";
import CreateTeamModal from "../components/CreateTeamModal";

// ─── Constants ────────────────────────────────────────────

const STATUS_TABS: { label: string; value: TeamStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "🟢 Sẵn sàng", value: "AVAILABLE" },
  { label: "🔴 Đang bận", value: "BUSY" },
];

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "bg-green-500/20 text-green-300 border-green-500/30",
  BUSY: "bg-red-500/20 text-red-300 border-red-500/30",
};

// ─── Component ────────────────────────────────────────────

export default function CoordinatorTeamListPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeamStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters & Sort States
  const [searchName, setSearchName] = useState("");
  const [searchLeader, setSearchLeader] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");
  const [debouncedSearchLeader, setDebouncedSearchLeader] = useState("");
  const [debouncedSearchActive, setDebouncedSearchActive] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName);
      setDebouncedSearchLeader(searchLeader);
      setDebouncedSearchActive(searchActive);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchName, searchLeader, searchActive]);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: { status?: TeamStatus; page: number; limit: number; sortBy: string; order: string; name?: string; leader?: string; active?: number } = {
        page,
        limit: 12,
        sortBy,
        order,
      };
      if (activeTab !== "ALL") filter.status = activeTab;
      if (debouncedSearchName.trim()) filter.name = debouncedSearchName.trim();
      if (debouncedSearchLeader.trim()) filter.leader = debouncedSearchLeader.trim();
      if (debouncedSearchActive.trim() && !isNaN(Number(debouncedSearchActive))) {
        filter.active = Number(debouncedSearchActive);
      }
      
      const result = await teamRepository.getTeams(filter);
      setTeams(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách đội");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, sortBy, order, debouncedSearchName, debouncedSearchLeader, debouncedSearchActive]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, sortBy, order, debouncedSearchName, debouncedSearchLeader, debouncedSearchActive]);

  const handleTabChange = (tab: TeamStatus | "ALL") => {
    setActiveTab(tab);
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    fetchTeams();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
                👥 Quản lí team
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white">
                  {total} đội
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchTeams}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {loading ?
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang tải...
                  </span>
                : "🔄 Làm mới"}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                ➕ Tạo đội mới
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value ?
                    "bg-[#FF7700] text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <input
              type="text"
              placeholder="🔍 Tìm tên đội..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF7700] flex-1 md:w-32"
            />
            <input
              type="text"
              placeholder="🔍 Tìm leader..."
              value={searchLeader}
              onChange={(e) => setSearchLeader(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF7700] flex-1 md:w-32"
            />
            <input
              type="number"
              min="0"
              placeholder="Số TV active"
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF7700] w-28"
            />
            <select
              title="Sắp xếp"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF7700] w-full md:w-auto"
            >
              <option value="createdAt" className="bg-[#1a3a52]">Mới nhất</option>
              <option value="name" className="bg-[#1a3a52]">Tên đội</option>
              <option value="status" className="bg-[#1a3a52]">Trạng thái</option>
              <option value="active" className="bg-[#1a3a52]">Thành viên Active</option>
              <option value="leader" className="bg-[#1a3a52]">Tên Leader</option>
            </select>
            <select
              title="Thứ tự"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF7700] w-full md:w-auto"
            >
              <option value="desc" className="bg-[#1a3a52]">Giảm dần</option>
              <option value="asc" className="bg-[#1a3a52]">Tăng dần</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              <p className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
              <button
                onClick={fetchTeams}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300 text-lg">Đang tải danh sách đội...</p>
            </div>
          )}

          {/* Team Grid */}
          {!loading && !error && (
            <section>
              {teams.length === 0 ?
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-300 text-lg">Chưa có đội nào</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Nhấn &quot;Tạo đội mới&quot; để bắt đầu
                  </p>
                </div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <Link
                      key={team._id}
                      href={`/team-control/${team._id}`}
                      className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all hover:shadow-xl hover:border-[#FF7700]/50 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold text-lg group-hover:text-[#FF7700] transition-colors truncate">
                          {team.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[team.status] || STATUS_BADGE.AVAILABLE
                          }`}
                        >
                          {team.status === "AVAILABLE" ?
                            "Sẵn sàng"
                          : "Đang bận"}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>
                            Leader:{" "}
                            {team.teamLeader ? 
                              (team.teamLeader.displayName || team.teamLeader.userName) : 
                              "Chưa chỉ định"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>
                            {team.memberStats?.total || 0} thành viên{" "}
                            {team.memberStats && <span className="text-green-400 ml-1">({team.memberStats.active} active)</span>}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-right">
                        <span className="text-white/50 text-xl group-hover:text-[#FF7700] transition-colors">
                          →
                        </span>
                      </div>
                    </Link>
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
            </section>
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
