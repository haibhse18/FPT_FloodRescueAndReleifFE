"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

interface Request {
  id: string;
  type: string;
  incidentType: string;
  urgency: string;
  peopleCount: number;
  status: string;
  originalStatus: string;
  location: string;
  createdAt: string;
  completedAt?: string;
  statusText: string;
  statusColor: string;
}

export default function CitizenHistoryPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này không?")) return;
    setCancellingId(requestId);
    try {
      await requestRepository.cancelRequest(requestId);
      // Optimistically update local state so UI refreshes instantly
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              originalStatus: "CANCELLED",
              status: "completed",
              statusText: "Đã hủy",
              statusColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            }
            : r,
        ),
      );
    } catch (err: any) {
      alert(
        `❌ ${err?.response?.data?.message || err.message || "Không thể hủy yêu cầu. Vui lòng thử lại."}`,
      );
    } finally {
      setCancellingId(null);
    }
  };

  const fetchRequests = useCallback(async (targetPage: number, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestRepository.getMyRequests({
        page: targetPage,
        limit: 10,
        ...(status ? { status } : {}),
      });

      const statusMap: Record<string, { text: string; color: string; filter: string }> = {
        SUBMITTED: { text: "Chờ xử lý", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", filter: "pending" },
        VERIFIED: { text: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", filter: "in_progress" },
        REJECTED: { text: "Bị từ chối", color: "bg-red-500/20 text-red-400 border-red-500/30", filter: "completed" },
        IN_PROGRESS: { text: "Đang xử lý", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", filter: "in_progress" },
        PARTIALLY_FULFILLED: { text: "Chưa hoàn tất", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", filter: "in_progress" },
        FULFILLED: { text: "Hoàn thành", color: "bg-green-500/20 text-green-400 border-green-500/30", filter: "completed" },
        CLOSED: { text: "Đã đóng", color: "bg-green-700/20 text-green-500 border-green-700/30", filter: "completed" },
        CANCELLED: { text: "Đã hủy", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", filter: "completed" },
        Submitted: { text: "Chờ xử lý", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", filter: "pending" },
        Accepted: { text: "Đã chấp nhận", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", filter: "in_progress" },
        Verified: { text: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", filter: "in_progress" },
        Rejected: { text: "Bị từ chối", color: "bg-red-500/20 text-red-400 border-red-500/30", filter: "completed" },
        "In Progress": { text: "Đang xử lý", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", filter: "in_progress" },
        Fulfilled: { text: "Hoàn thành", color: "bg-green-500/20 text-green-400 border-green-500/30", filter: "completed" },
        Completed: { text: "Hoàn thành", color: "bg-green-500/20 text-green-400 border-green-500/30", filter: "completed" },
        Cancelled: { text: "Đã hủy", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", filter: "completed" },
      };

      const mappedRequests: Request[] = result.data.map((req: any) => {
        const st = statusMap[req.status] || statusMap["Submitted"];
        return {
          id: req.requestId || req._id || req.id || "unknown",
          type:
            req.type === "Rescue" || req.type === "rescue" ? "Cứu hộ"
              : req.type === "Relief" || req.type === "relief" ? "Cứu trợ"
                : req.incidentType ? `${req.incidentType}` : "Yêu cầu",
          incidentType: req.incidentType || req.type || "",
          urgency: req.priority || req.urgencyLevel || "",
          peopleCount: req.numberOfPeople || req.peopleCount || 1,
          status: st.filter,
          location:
            typeof req.location === "string" ? req.location : "",
          createdAt: new Date(req.createdAt).toLocaleString("vi-VN"),
          completedAt: req.completedAt
            ? new Date(req.completedAt).toLocaleString("vi-VN")
            : undefined,
          statusText: st.text,
          statusColor: st.color,
          originalStatus: req.status || "SUBMITTED",
        };
      });

      setRequests(mappedRequests);
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Không thể tải lịch sử yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(page, statusFilter);
  }, [fetchRequests, page, statusFilter]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Tính số trang để hiển thị (dạng: 1 … 4 5 6 … 10)
  const pageNumbers: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "…") {
      pageNumbers.push("…");
    }
  }
  const from = total === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, total);

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Banner */}
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl lg:text-2xl font-extrabold mb-0.5">
                Lịch sử yêu cầu
              </h1>
              <p className="text-white/90 text-xs lg:text-sm">
                {total > 0 ? `Hiển thị ${from}\u2013${to} trong ${total} yêu cầu` : "Theo dõi trạng thái các yêu cầu của bạn"}
              </p>
            </div>
            <button
              onClick={() => fetchRequests(page, statusFilter)}
              disabled={isLoading}
              className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Làm mới"
            >
              <span
                className={`text-xl ${isLoading ? "animate-spin inline-block" : ""}`}
              >
                🔄
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        {/* Background Pattern - Removed as it is now in layout */}

        <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Lọc theo trạng thái */}
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="flex gap-2 w-max lg:w-auto lg:flex-wrap">
              {[
                { label: "Tất cả", icon: "📋", value: "" },
                { label: "Chờ duyệt", icon: "⏱️", value: "SUBMITTED" },
                { label: "Đã xác nhận", icon: "✅", value: "VERIFIED" },
                { label: "Đang xử lý", icon: "⏳", value: "IN_PROGRESS" },
                { label: "Chưa hoàn tất", icon: "🔶", value: "PARTIALLY_FULFILLED" },
                { label: "Hoàn thành", icon: "🎉", value: "FULFILLED" },
                { label: "Đã đóng", icon: "🔒", value: "CLOSED" },
                { label: "Từ chối", icon: "❌", value: "REJECTED" },
                { label: "Đã hủy", icon: "🚫", value: "CANCELLED" },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => handleFilterChange(chip.value)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${statusFilter === chip.value
                    ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/20 scale-105"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>


          {/* Requests List */}
          <div className="space-y-3">
            {isLoading ?
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Đang tải...
                </h3>
                <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
              </div>
              : error ?
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Đã xảy ra lỗi
                  </h3>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchRequests(page, statusFilter)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
                  >
                    <span>🔄</span>
                    <span>Thử lại</span>
                  </button>
                </div>
                : requests.length === 0 ?
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">
                      {requests.length === 0 ? "📭" : "🔭"}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {requests.length === 0 ?
                        "Chưa có yêu cầu nào"
                        : "Không tìm thấy yêu cầu phù hợp"}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {requests.length === 0 ?
                        "Bạn chưa gửi yêu cầu cứu hộ/cứu trợ nào"
                        : "Thử thay đổi bộ lọc để xem các yêu cầu khác"}
                    </p>
                    {requests.length === 0 && (
                      <Link
                        href="/request"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
                      >
                        <span>➕</span>
                        <span>Tạo yêu cầu mới</span>
                      </Link>
                    )}
                  </div>
                  : requests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => router.push(`/history/${request.id}`)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/history/${request.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="block bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                    >
                      {/* Top row: type + status badge */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="text-base font-bold text-white truncate">
                          {request.type}
                        </h3>
                        <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold border ${request.statusColor}`}>
                          {request.statusText}
                        </span>
                      </div>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.incidentType && (
                          <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg">
                            🌊 {request.incidentType}
                          </span>
                        )}
                        {request.urgency && (
                          <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${["Critical", "critical"].includes(request.urgency)
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : ["High", "high"].includes(request.urgency)
                              ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}>
                            {["Critical", "critical"].includes(request.urgency) ? "🚨 Khẩn cấp"
                              : ["High", "high"].includes(request.urgency) ? "⚠️ Cao"
                                : "ℹ️ Bình thường"}
                          </span>
                        )}
                        <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg">
                          👥 {request.peopleCount} người
                        </span>
                      </div>

                      {/* Location */}
                      {request.location && (
                        <p className="text-sm text-gray-400 truncate mb-3">
                          📍 {request.location}
                        </p>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>🕐 {request.createdAt}</span>
                        {request.completedAt && (
                          <span className="text-green-400">✅ {request.completedAt}</span>
                        )}
                      </div>

                      {/* Mini progress bar */}
                      {(() => {
                        const isCancelled = ["REJECTED", "Rejected", "CANCELLED", "Cancelled"].includes(request.originalStatus);
                        const steps = ["Gửi", "Xác nhận", "Xử lý", "Cứu trợ", "Xong", "Đóng"];
                        const stepIndex =
                          request.originalStatus === "CLOSED" ? 5
                            : ["FULFILLED", "Fulfilled", "Completed"].includes(request.originalStatus) ? 4
                              : request.originalStatus === "PARTIALLY_FULFILLED" ? 3
                                : ["IN_PROGRESS", "In Progress"].includes(request.originalStatus) ? 2
                                  : ["VERIFIED", "Verified", "Accepted"].includes(request.originalStatus) ? 1
                                    : 0;
                        return (
                          <div className="mb-3 space-y-1">
                            <div className="flex items-center">
                              {steps.map((label, i) => (
                                <div key={i} className="flex items-center flex-1">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0 ${isCancelled ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : i < stepIndex ? "bg-green-500 text-white"
                                      : i === stepIndex ? "bg-[#FF7700] text-white ring-2 ring-[#FF7700]/40"
                                        : "bg-white/10 text-gray-600"
                                    }`}>
                                    {isCancelled ? "✕" : i < stepIndex ? "✓" : i + 1}
                                  </div>
                                  {i < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-0.5 ${!isCancelled && i < stepIndex ? "bg-green-500" : "bg-white/10"}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex">
                              {steps.map((label, i) => (
                                <div key={i} className="flex-1 text-center">
                                  <span className={`text-[8px] leading-tight ${isCancelled ? "text-red-400"
                                    : i === stepIndex ? "text-[#FF7700] font-bold"
                                      : i < stepIndex ? "text-green-400"
                                        : "text-gray-600"
                                    }`}>{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action row */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => router.push(`/history/${request.id}`)}
                          className="flex-1 px-3 py-2 bg-[#FF7700]/20 hover:bg-[#FF7700]/30 border border-[#FF7700]/30 rounded-xl text-[#FF7700] text-xs font-bold text-center transition-all cursor-pointer"
                        >
                          Xem chi tiết →
                        </button>
                        {!["CANCELLED", "Cancelled", "FULFILLED", "Fulfilled", "CLOSED", "Closed", "REJECTED", "Rejected", "Completed"].includes(
                          request.originalStatus,
                        ) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelRequest(request.id);
                              }}
                              disabled={cancellingId === request.id}
                              className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {cancellingId === request.id ? (
                                <><span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" /> Hủy...</>
                              ) : "🚫 Hủy"}
                            </button>
                          )}
                      </div>
                    </div>
                  ))
            }
          </div>

          {/* Phân trang */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-2 text-gray-600">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p
                      ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Tiếp →
              </button>
            </div>
          )}
          {!isLoading && !error && total > 0 && (
            <p className="text-center text-xs text-gray-500">
              {from}–{to} / {total} yêu cầu
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
