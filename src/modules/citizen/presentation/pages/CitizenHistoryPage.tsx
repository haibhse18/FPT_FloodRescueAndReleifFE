"use client";

import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiFilter,
  FiInbox,
  FiList,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSlash,
  FiUsers,
  FiX,
} from "react-icons/fi";

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
  const [filter, setFilter] = useState<
    "all" | "pending" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    fetchRequests(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchRequests = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await requestRepository.getMyRequests({
        page,
        limit: pageSize,
      });

      const data = Array.isArray(response) ? response : (response as any).data || [];
      const metadata = (response as any);

      if (metadata.total !== undefined) {
        setTotalRequests(metadata.total);
        setTotalPages(metadata.totalPages || Math.ceil(metadata.total / pageSize));
      }

      // Map API response to UI format
      const mappedRequests: Request[] = data.map((req: any) => {
        const statusMap: Record<
          string,
          { text: string; color: string; filter: string }
        > = {
          SUBMITTED: {
            text: "Chờ xử lý",
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            filter: "pending",
          },
          Submitted: {
            text: "Chờ xử lý",
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            filter: "pending",
          },
          VERIFIED: {
            text: "Đã tiếp nhận",
            color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            filter: "in_progress",
          },
          Accepted: {
            text: "Đã chấp nhận",
            color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            filter: "in_progress",
          },
          REJECTED: {
            text: "Bị từ chối",
            color: "bg-red-500/20 text-red-400 border-red-500/30",
            filter: "completed",
          },
          Rejected: {
            text: "Bị từ chối",
            color: "bg-red-500/20 text-red-400 border-red-500/30",
            filter: "completed",
          },
          IN_PROGRESS: {
            text: "Đang xử lý",
            color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            filter: "in_progress",
          },
          "In Progress": {
            text: "Đang xử lý",
            color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            filter: "in_progress",
          },
          PARTIALLY_FULFILLED: {
            text: "Xử lý một phần (chờ đóng)",
            color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
            filter: "in_progress",
          },
          CLOSED: {
            text: "Hoàn thành",
            color: "bg-green-500/20 text-green-400 border-green-500/30",
            filter: "completed",
          },
          COMPLETED: {
            text: "Hoàn thành",
            color: "bg-green-500/20 text-green-400 border-green-500/30",
            filter: "completed",
          },
          Completed: {
            text: "Hoàn thành",
            color: "bg-green-500/20 text-green-400 border-green-500/30",
            filter: "completed",
          },
          CANCELLED: {
            text: "Đã hủy",
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            filter: "cancelled",
          },
          Cancelled: {
            text: "Đã hủy",
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            filter: "cancelled",
          },
        };

        const status = statusMap[req.status] || statusMap["Submitted"];

        return {
          id: req.requestId || req._id || req.id || "unknown",
          type:
            req.type === "Rescue" || req.type === "rescue" ? "Cứu hộ"
              : req.type === "Relief" || req.type === "supply" ? "Cứu trợ"
                : req.incidentType
                  ? `${req.incidentType}`
                  : "Yêu cầu",
          status: status.filter,
          location:
            typeof req.location === "string" ? req.location
              : req.location?.coordinates ?
                `${req.location.coordinates[1]?.toFixed(4)}, ${req.location.coordinates[0]?.toFixed(4)}`
                : req.latitude != null && req.longitude != null ?
                  `${Number(req.latitude).toFixed(4)}, ${Number(req.longitude).toFixed(4)}`
                  : "Không xác định",
          createdAt: new Date(req.createdAt).toLocaleString("vi-VN"),
          completedAt:
            req.completedAt ?
              new Date(req.completedAt).toLocaleString("vi-VN")
              : undefined,
          statusText: status.text,
          statusColor: status.color,
          priority:
            req.priority?.toLowerCase() ||
            req.urgencyLevel?.toLowerCase() ||
            "medium",
          peopleCount: req.peopleCount || req.numberOfPeople || 1,
          description: req.description,
          originalStatus: req.status || "Submitted",
        };
      });

      setRequests(mappedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Không thể tải lịch sử yêu cầu. Vui lòng thử lại sau.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setCancelingId(requestId);
    try {
      await requestRepository.cancelRequest(requestId, {
        reason: "Hủy bởi người dùng",
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: "cancelled",
              originalStatus: "CANCELLED",
              statusText: "Đã hủy",
              statusColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            }
            : r,
        ),
      );
      setCancelConfirmId(null);
    } catch (err: any) {
      alert(`${err?.response?.data?.message || err.message || "Không thể hủy yêu cầu"}`);
    } finally {
      setCancelingId(null);
    }
  };

  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter,
  );

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
                Theo dõi trạng thái các yêu cầu của bạn
              </p>
            </div>
            <button
              onClick={() => fetchRequests(1)}
              disabled={isLoading}
              className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Làm mới"
            >
              <FiRefreshCw className={`text-xl ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        {/* Background Pattern - Removed as it is now in layout */}

        <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-sm font-bold mr-2">
                <span className="inline-flex items-center gap-1.5"><FiFilter /> Lọc:</span>
              </span>
              {[
                {
                  value: "all",
                  label: "Tất cả",
                  icon: <FiList />,
                  count: requests.length,
                  activeClass: "bg-slate-500/30 text-slate-100 border border-slate-400/40 shadow-lg shadow-slate-900/20",
                  inactiveClass: "bg-slate-500/10 text-slate-300 border border-slate-500/20 hover:bg-slate-500/20 hover:text-slate-100",
                  badgeActiveClass: "bg-slate-200/20 text-slate-100",
                  badgeInactiveClass: "bg-slate-500/20 text-slate-300",
                },
                {
                  value: "pending",
                  label: "Chờ xử lý",
                  icon: <FiClock />,
                  count: requests.filter((r) => r.status === "pending").length,
                  activeClass: "bg-amber-500/30 text-amber-100 border border-amber-400/40 shadow-lg shadow-amber-900/20",
                  inactiveClass: "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-100",
                  badgeActiveClass: "bg-amber-200/20 text-amber-100",
                  badgeInactiveClass: "bg-amber-500/20 text-amber-200",
                },
                {
                  value: "in_progress",
                  label: "Đang xử lý",
                  icon: <FiRefreshCw />,
                  count: requests.filter((r) => r.status === "in_progress").length,
                  activeClass: "bg-sky-500/30 text-sky-100 border border-sky-400/40 shadow-lg shadow-sky-900/20",
                  inactiveClass: "bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-100",
                  badgeActiveClass: "bg-sky-200/20 text-sky-100",
                  badgeInactiveClass: "bg-sky-500/20 text-sky-200",
                },
                {
                  value: "completed",
                  label: "Hoàn thành",
                  icon: <FiCheckCircle />,
                  count: requests.filter((r) => r.status === "completed").length,
                  activeClass: "bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 shadow-lg shadow-emerald-900/20",
                  inactiveClass: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-100",
                  badgeActiveClass: "bg-emerald-200/20 text-emerald-100",
                  badgeInactiveClass: "bg-emerald-500/20 text-emerald-200",
                },
                {
                  value: "cancelled",
                  label: "Đã hủy",
                  icon: <FiSlash />,
                  count: requests.filter((r) => r.status === "cancelled").length,
                  activeClass: "bg-rose-500/30 text-rose-100 border border-rose-400/40 shadow-lg shadow-rose-900/20",
                  inactiveClass: "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-100",
                  badgeActiveClass: "bg-rose-200/20 text-rose-100",
                  badgeInactiveClass: "bg-rose-500/20 text-rose-200",
                },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value as typeof filter)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === btn.value ?
                    btn.activeClass
                    : btn.inactiveClass
                    }`}
                >
                  <span>{btn.icon}</span>
                  <span>{btn.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === btn.value ? "bg-white/20" : "bg-white/10"
                    } ${filter === btn.value ? btn.badgeActiveClass : btn.badgeInactiveClass}`}>
                    {btn.count}
                  </span>
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
                  <div className="mb-4 flex justify-center">
                    <FiAlertTriangle className="text-6xl text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Đã xảy ra lỗi
                  </h3>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchRequests(1)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
                  >
                    <FiRefreshCw />
                    <span>Thử lại</span>
                  </button>
                </div>
                : filteredRequests.length === 0 ?
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="mb-4 flex justify-center">
                      {requests.length === 0 ? (
                        <FiInbox className="text-6xl text-gray-400" />
                      ) : (
                        <FiSearch className="text-6xl text-gray-400" />
                      )}
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
                        <FiPlus />
                        <span>Tạo yêu cầu mới</span>
                      </Link>
                    )}
                  </div>
                  : filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="space-y-3">
                        <div>
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
                                "KHẨN CẤP"
                                : request.priority === "high" ?
                                  "CAO"
                                  : "BÌNH THƯỜNG"}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">
                            {request.type}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p className="flex items-center gap-2">
                              <FiMapPin className="flex-shrink-0" />
                              <span>{request.location}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <FiUsers className="flex-shrink-0" />
                              <span>{request.peopleCount} người</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <FiClock className="flex-shrink-0" />
                              <span>Tạo lúc: {request.createdAt}</span>
                            </p>
                            {request.completedAt && (
                              <p className="flex items-center gap-2 text-green-400">
                                <FiCheckCircle className="flex-shrink-0" />
                                <span>Hoàn thành: {request.completedAt}</span>
                              </p>
                            )}
                            {request.description && (
                              <p className="flex items-start gap-2 mt-1">
                                <FiFileText className="flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2 text-gray-400">
                                  {request.description}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Mini 4-step status progress */}
                        <div className="pt-1">
                          {(() => {
                            const isCancelled =
                              request.originalStatus === "REJECTED" ||
                              request.originalStatus === "CANCELLED";
                            const steps = [
                              { label: "Gửi" },
                              { label: "Tiếp nhận" },
                              { label: "Xử lý" },
                              { label: "Xong" },
                            ];
                            const stepIndex =
                              ["Completed", "COMPLETED", "PARTIALLY_FULFILLED", "CLOSED"].includes(request.originalStatus) ? 3
                                : ["In Progress", "IN_PROGRESS"].includes(request.originalStatus) ? 2
                                  : ["Accepted", "VERIFIED"].includes(request.originalStatus) ? 1
                                    : 0;
                            return (
                              <div>
                                {/* Progress bar with steps and labels */}
                                <div className="flex items-center">
                                  {steps.map((step, i) => {
                                    const done = !isCancelled && i < stepIndex;
                                    const active = !isCancelled && i === stepIndex;
                                    const cancelled = isCancelled;
                                    const activeCompleted =
                                      active && stepIndex === steps.length - 1;

                                    return (
                                      <Fragment key={i}>
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all ${cancelled
                                            ? "bg-red-500/30 text-red-300 border border-red-500/50"
                                            : done
                                              ? "bg-green-500 text-white border border-green-400"
                                              : activeCompleted
                                                ? "bg-green-500 text-white border border-green-400"
                                                : active
                                                  ? "bg-[#FF7700] text-white ring-2 ring-[#FF7700]/40 border border-[#FF7700]"
                                                  : "bg-white/10 text-gray-300 border border-white/20"
                                            }`}
                                        >
                                          {cancelled ? (
                                            <FiX className="text-xs" />
                                          ) : done || activeCompleted ? (
                                            <FiCheckCircle className="text-xs" />
                                          ) : (
                                            i + 1
                                          )}
                                        </div>
                                        {i < steps.length - 1 && (
                                          <div
                                            className={`flex-1 h-0.5 transition-all ${cancelled
                                              ? "bg-red-500/30"
                                              : i < stepIndex || activeCompleted
                                                ? "bg-green-500"
                                                : i === stepIndex
                                                  ? "bg-[#FF7700]"
                                                  : "bg-white/10"
                                              }`}
                                          />
                                        )}
                                      </Fragment>
                                    );
                                  })}
                                </div>

                                <div className="mt-2 grid grid-cols-4 gap-1">
                                  {steps.map((step, i) => {
                                    const activeCompleted =
                                      !isCancelled && i === stepIndex && stepIndex === steps.length - 1;

                                    return (
                                      <span
                                        key={`label-${i}`}
                                        className={`text-xs font-semibold text-center leading-tight ${isCancelled
                                          ? "text-red-400"
                                          : activeCompleted
                                            ? "text-green-400"
                                            : i === stepIndex
                                              ? "text-[#FF7700] font-bold"
                                              : i < stepIndex
                                                ? "text-green-400"
                                                : "text-gray-500"
                                          }`}
                                      >
                                        {step.label}
                                      </span>
                                    );
                                  })}
                                </div>
                                {isCancelled && (
                                  <p className="mt-2 text-xs text-red-400 font-bold">
                                    <span className="inline-flex items-center gap-1"><FiX />
                                      {request.originalStatus === "Rejected"
                                        || request.originalStatus === "REJECTED"
                                        ? "Yêu cầu bị từ chối"
                                        : "Yêu cầu đã hủy"}
                                    </span>
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Link
                          href={`/history/${request.id}`}
                          className="flex-1 px-4 py-2 bg-[#FF7700]/20 hover:bg-[#FF7700]/30 border border-[#FF7700]/30 rounded-xl text-[#FF7700] hover:text-[#FF8800] text-sm font-bold text-center transition-all inline-flex items-center justify-center gap-2"
                        >
                          <FiEye /> Xem chi tiết
                        </Link>
                        {!(["Completed", "COMPLETED", "PARTIALLY_FULFILLED", "CLOSED", "Cancelled", "CANCELLED", "Rejected", "REJECTED"].includes(request.originalStatus)) && (
                          <button
                            onClick={() => setCancelConfirmId(request.id)}
                            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 text-sm font-bold transition-all inline-flex items-center justify-center gap-2"
                          >
                            <FiSlash /> Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  ))
            }
          </div>

          {/* Pagination Controls */}
          {requests.length > 0 && (
            <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === page
                        ? "bg-[#FF7700] text-white ring-2 ring-[#FF7700]/40"
                        : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {cancelConfirmId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
            <div className="bg-[#1a3a52] rounded-xl p-6 max-w-sm w-full border border-white/20">
              <h3 className="text-white font-bold text-lg mb-3">
                Xác nhận hủy yêu cầu
              </h3>
              <p className="text-gray-300 mb-6 text-sm">
                Bạn có chắc muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelRequest(cancelConfirmId)}
                  disabled={cancelingId === cancelConfirmId}
                  className="flex-1 px-4 py-3 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {cancelingId === cancelConfirmId ? "Đang xử lý..." : "Hủy yêu cầu"}
                </button>
                <button
                  onClick={() => setCancelConfirmId(null)}
                  disabled={cancelingId === cancelConfirmId}
                  className="flex-1 px-4 py-3 rounded-lg font-bold bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
