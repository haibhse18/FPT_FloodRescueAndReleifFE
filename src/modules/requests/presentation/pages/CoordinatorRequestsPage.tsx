"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import type {
  CoordinatorRequest,
  RequestStatus,
  GetRequestsFilter,
} from "@/modules/requests/domain/request.entity";

// ─── Constants ────────────────────────────────────────────

const STATUS_TABS: { label: string; value: RequestStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "📩 Chờ xử lý", value: "SUBMITTED" },
  { label: "✅ Đã xác minh", value: "VERIFIED" },
  { label: "🔄 Đang xử lý", value: "IN_PROGRESS" },
  { label: "⚠️ Một phần", value: "PARTIALLY_FULFILLED" },
  { label: "📁 Đã đóng", value: "CLOSED" },
  { label: "🚫 Đã hủy", value: "CANCELLED" },
  { label: "❌ Từ chối", value: "REJECTED" },
];
// Note: FULFILLED status removed - backend auto-converts to CLOSED

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  VERIFIED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  REJECTED: "bg-red-600/20 text-red-300 border-red-600/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  PARTIALLY_FULFILLED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  CLOSED: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-500 text-white ring-red-500",
  High: "bg-orange-500 text-white ring-orange-500",
  Normal: "bg-blue-500 text-white ring-blue-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  Critical: "🔴 KHẨN CẤP",
  High: "🟠 CAO",
  Normal: "🔵 BÌNH THƯỜNG",
};

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Ưu tiên cao", value: "priority" },
];

// ─── Component ────────────────────────────────────────────

export default function CoordinatorRequestsPage() {
  const searchParams = useSearchParams();
  const initStatus = (searchParams?.get("status") as RequestStatus) || "ALL";

  const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RequestStatus | "ALL">(initStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");

  useEffect(() => {
    const status = searchParams?.get("status") as RequestStatus;
    // Only update if it's a valid tab and differs
    if (status && STATUS_TABS.some((t) => t.value === status)) {
      setActiveTab(status);
      setPage(1);
    }
  }, [searchParams]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: GetRequestsFilter = { page, limit: 15 };
      if (activeTab !== "ALL") filters.status = activeTab;

      const result = await requestRepository.getAllRequests(filters);
      let sortedData = result.data || [];
      
      // Client-side sorting
      if (sortBy === "newest") {
        sortedData = [...sortedData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        sortedData = [...sortedData].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortBy === "priority") {
        const priorityOrder = { Critical: 0, High: 1, Normal: 2 };
        sortedData = [...sortedData].sort((a, b) => {
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
          return aPriority - bPriority;
        });
      }
      
      setRequests(sortedData);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách yêu cầu");
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, sortBy]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleTabChange = (tab: RequestStatus | "ALL") => {
    setActiveTab(tab);
    setPage(1);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocationDisplay = (request: CoordinatorRequest) => {
    if (request.address) return request.address;
    if (request.location?.coordinates) {
      const [lng, lat] = request.location.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    if (request.latitude && request.longitude) {
      return `${request.latitude.toFixed(4)}, ${request.longitude.toFixed(4)}`;
    }
    return "Chưa có địa chỉ";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
                Yêu cầu cứu trợ
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white">
                  {total} yêu cầu
                </span>
              </div>
            </div>
            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ?
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang tải...
                </span>
              : "🔄 Làm mới"}
            </button>
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

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium">Sắp xếp:</span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    sortBy === option.value ?
                      "bg-[#FF7700] text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
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

          {/* Loading */}
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
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">
                  Danh sách yêu cầu ({requests.length})
                </h2>
              </div>

              {requests.length === 0 ?
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-300 text-lg">Không có yêu cầu nào</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Thử thay đổi bộ lọc hoặc làm mới danh sách
                  </p>
                </div>
              : <div className="space-y-3">
                  {requests.map((request) => (
                    <Link
                      key={request._id}
                      href={`/requests/${request._id}`}
                      className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all hover:shadow-xl hover:border-[#FF7700]/50 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Priority Badge */}
                        <div
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
                            PRIORITY_COLORS[request.priority] ||
                            PRIORITY_COLORS.Normal
                          } ring-2 ring-offset-2 ring-offset-[#133249]`}
                        >
                          {PRIORITY_LABELS[request.priority] ||
                            request.priority}
                        </div>

                        {/* Request Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="text-2xl">
                              {request.type === "Rescue" ? "🆘" : "📦"}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg group-hover:text-[#FF7700] transition-colors">
                                {request.userName ||
                                  request.displayName ||
                                  "Ẩn danh"}
                              </h3>
                              <p className="text-gray-300 text-sm line-clamp-2">
                                {request.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              📍 {getLocationDisplay(request)}
                            </span>
                            <span>•</span>
                            <span>🕐 {formatDate(request.createdAt)}</span>
                            {request.peopleCount && (
                              <>
                                <span>•</span>
                                <span>👥 {request.peopleCount} người</span>
                              </>
                            )}
                            {request.isDuplicated && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-400">
                                  📎 Trùng lặp
                                </span>
                              </>
                            )}
                            {request.source && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500 text-xs">
                                  {request.source === "COORDINATOR" ?
                                    "Coord"
                                  : "Citizen"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${
                              STATUS_COLORS[request.status] ||
                              STATUS_COLORS.SUBMITTED
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="text-white/50 text-2xl group-hover:text-[#FF7700] transition-colors">
                          →
                        </div>
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
    </div>
  );
}
