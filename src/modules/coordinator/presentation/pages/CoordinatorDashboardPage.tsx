"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileBottomNav, DesktopSidebar } from "@/shared/components/layout";
import { GetAllRequestsUseCase } from "@/modules/coordinator/application/getAllRequests.usecase";
import { coordinatorRepository } from "@/modules/coordinator/infrastructure/coordinator.repository.impl";
import { CoordinatorRequest } from "@/modules/coordinator/domain/request.entity";

const getAllRequestsUseCase = new GetAllRequestsUseCase(coordinatorRepository);

// Priority badge colors
const PRIORITY_COLORS = {
  critical: "bg-red-500 text-white ring-red-500",
  high: "bg-[#FF7700] text-white ring-[#FF7700]",
  normal: "bg-yellow-500 text-white ring-yellow-500",
} as const;

// Status badge colors
const STATUS_COLORS = {
  Submitted: "bg-gray-500 text-white",
  Verified: "bg-blue-500 text-white",
  "In Progress": "bg-yellow-500 text-white",
  Completed: "bg-green-500 text-white",
  Spam: "bg-red-500 text-white line-through",
  Rejected: "bg-red-600 text-white",
  Cancelled: "bg-gray-400 text-white",
} as const;

// Priority labels in Vietnamese
const PRIORITY_LABELS = {
  critical: "🔴 KHẨN CẤP",
  high: "🟠 CAO",
  normal: "🟡 BÌNH THƯỜNG",
} as const;

export default function CoordinatorDashboardPage() {
  const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    verified: 0,
    inProgress: 0,
    completed: 0,
    critical: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterPriority]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: any = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterPriority !== "all") filters.priority = filterPriority;

      const result = await getAllRequestsUseCase.execute(filters);
      setRequests(result.data || []);

      // Calculate stats
      const allRequests = result.data || [];
      setStats({
        total: allRequests.length,
        submitted: allRequests.filter((r) => r.status === "Submitted").length,
        verified: allRequests.filter((r) => r.status === "Verified").length,
        inProgress: allRequests.filter((r) => r.status === "In Progress")
          .length,
        completed: allRequests.filter((r) => r.status === "Completed").length,
        critical: allRequests.filter((r) => r.priority === "critical").length,
      });
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách yêu cầu");
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Fixed Header */}
        <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight uppercase">
                Bảng điều phối
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white">
                  Coordinator Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="pb-24 lg:pb-0 overflow-auto">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Quick Stats */}
            <section
              className="grid grid-cols-2 lg:grid-cols-6 gap-4"
              aria-label="Thống kê tổng quan"
            >
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-black text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Tổng yêu cầu
                </div>
              </div>
              <div className="bg-gray-500/20 border border-gray-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-white">
                  {stats.submitted}
                </div>
                <div className="text-sm text-gray-300 mt-1">Chờ xử lý</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-white">
                  {stats.verified}
                </div>
                <div className="text-sm text-gray-300 mt-1">Đã xác minh</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-white">
                  {stats.inProgress}
                </div>
                <div className="text-sm text-gray-300 mt-1">Đang xử lý</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-white">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-300 mt-1">Hoàn thành</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 animate-pulse">
                <div className="text-3xl font-black text-red-400">
                  {stats.critical}
                </div>
                <div className="text-sm text-red-300 mt-1">🔴 Khẩn cấp</div>
              </div>
            </section>

            {/* Filters */}
            <section
              className="bg-white/5 border border-white/10 rounded-xl p-5"
              aria-label="Bộ lọc"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-white font-bold text-lg">Bộ lọc</h2>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#1a3a52] text-white border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Submitted">Chờ xử lý</option>
                    <option value="Verified">Đã xác minh</option>
                    <option value="In Progress">Đang xử lý</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Spam">Spam</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-[#1a3a52] text-white border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                  >
                    <option value="all">Tất cả mức độ</option>
                    <option value="critical">🔴 Khẩn cấp</option>
                    <option value="high">🟠 Cao</option>
                    <option value="normal">🟡 Bình thường</option>
                  </select>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchRequests}
                    disabled={isLoading}
                    className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                    aria-label="Làm mới danh sách"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang tải...
                      </span>
                    ) : (
                      "🔄 Làm mới"
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Error State */}
            {error && (
              <div
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200"
                role="alert"
              >
                <p className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
                <button
                  onClick={fetchRequests}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Đang tải danh sách yêu cầu...
                </p>
              </div>
            )}

            {/* Requests List */}
            {!isLoading && !error && (
              <section aria-label="Danh sách yêu cầu cứu hộ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-xl">
                    Danh sách yêu cầu ({requests.length})
                  </h2>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-300 text-lg">
                      Không có yêu cầu nào
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Thử thay đổi bộ lọc hoặc làm mới danh sách
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <Link
                        key={request.requestId}
                        href={`/coordinator/requests/${request.requestId}`}
                        className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all hover:shadow-xl hover:border-[#FF7700]/50 group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Priority Badge */}
                          <div
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
                              PRIORITY_COLORS[request.priority]
                            } ring-2 ring-offset-2 ring-offset-[#133249]`}
                          >
                            {PRIORITY_LABELS[request.priority]}
                          </div>

                          {/* Request Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="text-2xl">
                                {request.type === "Rescue" ? "🆘" : "📦"}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-lg group-hover:text-[#FF7700] transition-colors">
                                  {request.displayName || request.userName}
                                </h3>
                                <p className="text-gray-300 text-sm line-clamp-2">
                                  {request.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                📍 {request.address || "Chưa có địa chỉ"}
                              </span>
                              <span>•</span>
                              <span>🕐 {formatDate(request.createdAt)}</span>
                              {request.peopleCount && (
                                <>
                                  <span>•</span>
                                  <span>👥 {request.peopleCount} người</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                                STATUS_COLORS[
                                  request.status as keyof typeof STATUS_COLORS
                                ]
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          {/* Arrow Icon */}
                          <div className="text-white/50 text-2xl group-hover:text-[#FF7700] transition-colors">
                            →
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>

        <MobileBottomNav currentPath="/coordinator/dashboard" />
      </div>
    </div>
  );
}
