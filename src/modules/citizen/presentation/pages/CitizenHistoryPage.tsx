"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

interface Request {
  id: string;
  type: string;
  status: string;
  originalStatus: string;
  location: string;
  createdAt: string;
  completedAt?: string;
  statusText: string;
  statusColor: string;
  priority: string;
  peopleCount: number;
  description?: string;
}

export default function CitizenHistoryPage() {
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
          status: st.filter,
          location:
            typeof req.location === "string" ? req.location
              : req.location?.coordinates
                ? `${req.location.coordinates[1]?.toFixed(4)}, ${req.location.coordinates[0]?.toFixed(4)}`
                : req.latitude != null && req.longitude != null
                  ? `${Number(req.latitude).toFixed(4)}, ${Number(req.longitude).toFixed(4)}`
                  : "Không xác định",
          createdAt: new Date(req.createdAt).toLocaleString("vi-VN"),
          completedAt: req.completedAt
            ? new Date(req.completedAt).toLocaleString("vi-VN")
            : undefined,
          statusText: st.text,
          statusColor: st.color,
          priority: req.priority?.toLowerCase() || req.urgencyLevel?.toLowerCase() || "medium",
          peopleCount: req.peopleCount || req.numberOfPeople || 1,
          description: req.description,
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
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-mono text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                              #{(request.id?.length ?? 0) > 8 ? request.id.slice(-8).toUpperCase() : (request.id ?? "N/A")}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold border ${request.statusColor}`}
                            >
                              {request.statusText}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-bold ${request.priority === "critical" ?
                                "bg-red-500/20 text-red-400 border border-red-500/30"
                                : request.priority === "high" ?
                                  "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                }`}
                            >
                              {request.priority === "critical" ?
                                "🚨 KHẨN CẤP"
                                : request.priority === "high" ?
                                  "⚠️ CAO"
                                  : "ℹ️ BÌNH THƯỜNG"}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">
                            {request.type}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p className="flex items-center gap-2">
                              <span>📍</span>
                              <span>{request.location}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>👥</span>
                              <span>{request.peopleCount} người</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>Tạo lúc: {request.createdAt}</span>
                            </p>
                            {request.completedAt && (
                              <p className="flex items-center gap-2 text-green-400">
                                <span>✅</span>
                                <span>Hoàn thành: {request.completedAt}</span>
                              </p>
                            )}
                            {request.description && (
                              <p className="flex items-start gap-2 mt-1">
                                <span className="flex-shrink-0">📝</span>
                                <span className="line-clamp-2 text-gray-400">
                                  {request.description}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {/* Mini 6-step status progress — matches swagger lifecycle */}
                        <div className="flex-1">
                          {(() => {
                            const isCancelled =
                              ["Rejected", "REJECTED", "Cancelled", "CANCELLED"].includes(
                                request.originalStatus,
                              );
                            // 6 steps matching swagger: SUBMITTED→VERIFIED→IN_PROGRESS→PARTIALLY_FULFILLED→FULFILLED→CLOSED
                            const steps = [
                              { label: "Gửi" },         // 0
                              { label: "Xác nhận" },    // 1
                              { label: "Xử lý" },       // 2
                              { label: "Cứu trợ" },     // 3
                              { label: "Xong" },         // 4
                              { label: "Đóng" },         // 5
                            ];
                            const stepIndex =
                              ["CLOSED"].includes(request.originalStatus) ? 5
                                : ["FULFILLED", "Fulfilled", "Completed"].includes(request.originalStatus) ? 4
                                  : ["PARTIALLY_FULFILLED"].includes(request.originalStatus) ? 3
                                    : ["IN_PROGRESS", "In Progress"].includes(request.originalStatus) ? 2
                                      : ["VERIFIED", "Verified", "Accepted"].includes(request.originalStatus) ? 1
                                        : 0; // SUBMITTED / Submitted / Pending / unknown
                            return (
                              <div className="space-y-1 mb-3">
                                {/* Step nodes + connectors */}
                                <div className="flex items-center">
                                  {steps.map((step, i) => {
                                    const done = !isCancelled && i < stepIndex;
                                    const active = !isCancelled && i === stepIndex;
                                    const cancelled = isCancelled;
                                    return (
                                      <div key={i} className="flex items-center flex-1">
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 transition-all ${cancelled
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                            : done
                                              ? "bg-green-500 text-white"
                                              : active
                                                ? "bg-[#FF7700] text-white ring-2 ring-[#FF7700]/40"
                                                : "bg-white/10 text-gray-600"
                                            }`}
                                        >
                                          {cancelled ? "✕" : done ? "✓" : i + 1}
                                        </div>
                                        {i < steps.length - 1 && (
                                          <div
                                            className={`flex-1 h-0.5 mx-0.5 transition-all ${!cancelled && i < stepIndex
                                              ? "bg-green-500"
                                              : "bg-white/10"
                                              }`}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Step labels */}
                                <div className="flex">
                                  {steps.map((step, i) => (
                                    <div key={i} className="flex-1 text-center">
                                      <span
                                        className={`text-[9px] leading-tight ${isCancelled
                                          ? "text-red-400"
                                          : i === stepIndex
                                            ? "text-[#FF7700] font-bold"
                                            : i < stepIndex
                                              ? "text-green-400"
                                              : "text-gray-600"
                                          }`}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {isCancelled && (
                                  <p className="text-xs text-red-400 font-bold">
                                    ✕{" "}
                                    {request.originalStatus === "Rejected"
                                      ? "Yêu cầu bị từ chối"
                                      : "Yêu cầu đã hủy"}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/history/${request.id}`}
                          className="flex-1 px-4 py-2 bg-[#FF7700]/20 hover:bg-[#FF7700]/30 border border-[#FF7700]/30 rounded-xl text-[#FF7700] hover:text-[#FF8800] text-sm font-bold text-center transition-all"
                        >
                          👁️ Xem chi tiết
                        </Link>

                        {/* Cancel button — hidden only when already terminal (cancelled/fulfilled/closed/rejected) */}
                        {!["CANCELLED", "Cancelled", "FULFILLED", "Fulfilled", "CLOSED", "Closed", "REJECTED", "Rejected", "Completed"].includes(
                          request.originalStatus,
                        ) && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={cancellingId === request.id}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 hover:text-red-300 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              {cancellingId === request.id ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                  Hủy...
                                </>
                              ) : (
                                "🚫 Hủy"
                              )}
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
