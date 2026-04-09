"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PiSirenBold,
  PiMapPinBold,
  PiUsersBold,
  PiArrowRightBold,
  PiArrowsInSimpleBold,
  PiArrowsOutSimpleBold,
  PiSortAscendingBold,
} from "react-icons/pi";
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiWifiOff,
  FiLink,
  FiPlus,
} from "react-icons/fi";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type {
  CoordinatorRequest,
  RequestStatus,
  GetRequestsFilter,
  CreateOnBehalfInput,
} from "@/modules/requests/domain/request.entity";
import { toast } from "sonner";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

const GoongCoordinatorMap = dynamic(
  () => import("@/modules/map/presentation/components/GoongCoordinatorMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0d2233] rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

// ─── Constants ────────────────────────────────────────────

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
  Critical: "bg-red-500 text-white",
  High: "bg-orange-500 text-white",
  Normal: "bg-blue-500 text-white",
};

const PRIORITY_LABELS: Record<string, string> = {
  Critical: "KHẨN CẤP",
  High: "CAO",
  Normal: "BÌNH THƯỜNG",
};

const PRIORITY_DOTS: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Normal: "bg-blue-500",
};

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Ưu tiên cao", value: "priority" },
];

// ─── Component ────────────────────────────────────────────

export default function CoordinatorRequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapFilterStatus, setMapFilterStatus] = useState<string>("ALL");
  const [mapFilterPriority, setMapFilterPriority] = useState<string>("ALL");
  const [mapFilterSource, setMapFilterSource] = useState<string>("ALL");

  // Refs for scrolling to selected card
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: GetRequestsFilter = { page, limit: 50 };

      const result = await requestRepository.getAllRequests(filters);
      let sortedData = result.data || [];
      
      // Client-side sorting
      if (sortBy === "newest") {
        sortedData = [...sortedData].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      } else if (sortBy === "oldest") {
        sortedData = [...sortedData].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;
          return timeA - timeB;
        });
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
  }, [page, sortBy]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehouseRepository.getWarehouses();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // When map filters change → update sidebar
  const handleFilterChange = useCallback((status: string, priority: string, source: string = "ALL") => {
    setMapFilterStatus(status);
    setMapFilterPriority(priority);
    setMapFilterSource(source);
    setSelectedRequestId(null);
  }, []);

  // When map marker is clicked → scroll list to card
  const handleMapRequestSelect = useCallback((id: string) => {
    setSelectedRequestId(id);
    const cardEl = cardRefs.current[id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // When card is clicked → set selected (map will flyTo via prop change)
  const handleCardClick = (id: string) => {
    router.push(`/requests/${id}`);
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

  const hasLocation = (request: CoordinatorRequest) => {
    const lng = request.location?.coordinates[0] || request.longitude;
    const lat = request.location?.coordinates[1] || request.latitude;
    return !!(lat && lng && lat !== 0 && lng !== 0);
  };

  // Apply map filters to sidebar list
  const filteredRequests = requests.filter((r) => {
    const statusOk = mapFilterStatus === "ALL" || r.status === mapFilterStatus;
    const priorityOk = mapFilterPriority === "ALL" || r.priority === mapFilterPriority;
    const sourceOk = mapFilterSource === "ALL" || r.source === mapFilterSource;
    return statusOk && priorityOk && sourceOk;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 z-20 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <PiSirenBold className="text-[#FF7700] text-xl flex-shrink-0" />
            <h1 className="text-white text-xl font-extrabold tracking-tight uppercase truncate">
              Yêu cầu cứu trợ
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-white">{total} yêu cầu</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"
              title={sidebarOpen ? "Thu gọn danh sách" : "Mở danh sách"}
            >
              {sidebarOpen ? <PiArrowsInSimpleBold className="text-base" /> : <PiArrowsOutSimpleBold className="text-base" />}
              <span className="hidden sm:inline">{sidebarOpen ? "Thu gọn" : "Danh sách"}</span>
            </button>
            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="flex-shrink-0 bg-[#FF7700] hover:bg-[#FF8820] text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <FiRefreshCw className={`text-base ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
            </button>
            <button
              onClick={() => router.push("/requests/create")}
              className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FiPlus className="text-base" />
              <span>Tạo hộ</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main split-pane ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Map (fills all remaining space) ── */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <GoongCoordinatorMap
            requests={requests}
            warehouses={warehouses}
            selectedRequestId={selectedRequestId}
            onRequestSelect={handleMapRequestSelect}
            filterStatus={mapFilterStatus}
            filterPriority={mapFilterPriority}
            filterSource={mapFilterSource}
            onFilterChange={handleFilterChange}
            className="w-full h-full"
          />
        </div>

        {/* ── Right: Request list (collapsible) ── */}
        <div
          style={{ width: sidebarOpen ? 380 : 0 }}
          className={`flex-shrink-0 flex flex-col bg-[#0d1e2c] transition-[width] duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "border-l border-white/10 pointer-events-auto" : "pointer-events-none"
          }`}
        >

          {/* Panel header: sort only */}
          <div className="flex-shrink-0 p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PiSortAscendingBold className="text-gray-400 text-base flex-shrink-0" />
              <span className="text-gray-400 text-xs font-medium flex-shrink-0">Sắp xếp:</span>
              <div className="flex gap-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                    className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      sortBy === option.value
                        ? "bg-[#FF7700] text-white"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex-shrink-0 mx-3 mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-xs">
              <p className="flex items-center gap-1.5">
                <FiAlertTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </p>
              <button onClick={fetchRequests} className="mt-1 underline hover:no-underline">
                Thử lại
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-300 text-sm">Đang tải...</p>
            </div>
          )}

          {/* Request cards – scrollable */}
          {!isLoading && !error && (
            <>
              <div className="flex-shrink-0 px-3 pt-2 pb-1 flex items-center justify-between">
                <span className="text-gray-400 text-xs font-medium">
                  {filteredRequests.length}{mapFilterStatus !== "ALL" || mapFilterPriority !== "ALL" || mapFilterSource !== "ALL" ? ` / ${requests.length}` : ""} yêu cầu
                  {selectedRequestId && (
                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className="ml-2 text-[#FF7700] hover:text-[#FF8820] underline"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </span>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <PiMapPinBold />
                  {requests.filter(hasLocation).length} có tọa độ
                </span>
              </div>

              <div
                ref={listContainerRef}
                className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-hide"
              >
                {filteredRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <PiSirenBold className="text-5xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm">Không có yêu cầu nào</p>
                    <p className="text-gray-500 text-xs mt-1">Thử thay đổi bộ lọc</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => {
                    const isSelected = selectedRequestId === request._id;
                    return (
                      <div
                        key={request._id}
                        ref={(el) => { cardRefs.current[request._id] = el; }}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? "border-[#FF7700] bg-[#FF7700]/10 shadow-lg shadow-[#FF7700]/20"
                            : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                        }`}
                      >
                        {/* Card click area → focus map */}
                        <button
                          onClick={() => handleCardClick(request._id)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            {/* Type icon */}
                            {request.type === "Rescue"
                              ? <PiSirenBold className="text-lg text-red-400 flex-shrink-0 mt-0.5" />
                              : <FiPackage className="text-lg text-blue-400 flex-shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                                    PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.Normal
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[request.priority] || "bg-blue-500"}`} />
                                  {PRIORITY_LABELS[request.priority] || request.priority}
                                </span>
                                {!hasLocation(request) && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-400 flex-shrink-0">
                                    <FiWifiOff className="text-xs" /> No GPS
                                  </span>
                                )}
                              </div>
                              <p className="text-white font-semibold text-sm truncate">
                                {request.userName || request.displayName || "Ẩn danh"}
                              </p>
                              <p className="text-gray-400 text-xs line-clamp-2 mt-0.5">
                                {request.description}
                              </p>
                            </div>
                            {/* Status badge */}
                            <span
                              className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold border ${
                                STATUS_COLORS[request.status] || STATUS_COLORS.SUBMITTED
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1 truncate max-w-full">
                              <PiMapPinBold className="flex-shrink-0" />
                              <span className="truncate">{getLocationDisplay(request)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="flex-shrink-0" />
                              {formatDate(request.createdAt)}
                            </span>
                            {request.peopleCount && (
                              <span className="flex items-center gap-1">
                                <PiUsersBold className="flex-shrink-0" />
                                {request.peopleCount}
                              </span>
                            )}
                            {request.isDuplicated && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <FiLink className="flex-shrink-0" /> Trùng
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Detail link */}
                        <div className="px-3 pb-2.5">
                          <Link
                            href={`/requests/${request._id}`}
                            className="flex items-center justify-center gap-1.5 w-full text-center py-1.5 rounded-lg bg-white/5 hover:bg-[#FF7700]/20 hover:text-[#FF7700] text-gray-400 text-xs font-medium transition-colors border border-white/10 hover:border-[#FF7700]/30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Xem chi tiết <PiArrowRightBold />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 disabled:opacity-30 hover:bg-white/10 text-sm"
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="px-3 py-1.5 text-gray-400 text-sm">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 disabled:opacity-30 hover:bg-white/10 text-sm"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
