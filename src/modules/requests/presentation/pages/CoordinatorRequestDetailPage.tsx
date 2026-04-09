"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import { useToast } from "@/hooks/use-toast";

const GoongRequestMap = dynamic(
  () => import("@/modules/map/presentation/components/GoongRequestMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  },
);

// ─── Constants ────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-500 text-white ring-red-500",
  High: "bg-[#FF7700] text-white ring-[#FF7700]",
  Normal: "bg-blue-500 text-white ring-blue-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  Critical: "🔴 KHẨN CẤP",
  High: "🟠 CAO",
  Normal: "🔵 BÌNH THƯỜNG",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-gray-500 text-white",
  VERIFIED: "bg-blue-500 text-white",
  REJECTED: "bg-red-600 text-white",
  IN_PROGRESS: "bg-yellow-500 text-white",
  PARTIALLY_FULFILLED: "bg-purple-500 text-white",
  FULFILLED: "bg-green-500 text-white",
  CLOSED: "bg-gray-400 text-white",
  CANCELLED: "bg-gray-500 text-white",
};

// ─── Component ────────────────────────────────────────────

export default function CoordinatorRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;
  const { toast } = useToast();

  const [request, setRequest] = useState<CoordinatorRequest | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "verify" | "reject" | "cancel" | "close" | "set_priority" | null
  >(null);
  const [selectedPriority, setSelectedPriority] = useState<string>("Normal");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
      fetchWarehouses();
    }
  }, [requestId]);

  // Reverse geocode when request location is available but no address
  useEffect(() => {
    if (!request) return;
    const lat = request.location?.coordinates[1] || request.latitude;
    const lng = request.location?.coordinates[0] || request.longitude;
    if (!lat || !lng) return;
    if (request.address) {
      setResolvedAddress(request.address);
      return;
    }
    fetch(`/api/goong/reverse-geocode?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        const addr = data.results?.[0]?.formatted_address;
        if (addr) setResolvedAddress(addr);
      })
      .catch(() => {});
  }, [request]);

  const fetchRequestDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestRepository.getRequestDetail(requestId);
      setRequest(data);
      setSelectedPriority(data.priority || "Normal");
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin yêu cầu");
      console.error("Error fetching request detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseRepository.getWarehouses();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  // ─── Actions ─────────────────────────────────────────────

  const handleVerify = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await requestRepository.verifyRequest(request._id, {
        approved: true,
      });
      setRequest(updated);
      toast({
        title: "✅ Đã xác minh yêu cầu",
        description: "Vui lòng thiết lập mức độ ưu tiên",
      });
      // Prompt for priority right after successful verify
      setActionType("set_priority");
      // Keep modal open but change state
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi xác minh",
        description: err.message,
      });
      setShowConfirmDialog(false);
      setActionType(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await requestRepository.verifyRequest(request._id, {
        approved: false,
        reason: "Từ chối bởi Coordinator",
      });
      setRequest(updated);
      toast({ title: "❌ Đã từ chối yêu cầu" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message,
      });
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const handleCancel = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await requestRepository.cancelRequest(request._id, {
        reason: "Hủy bởi Coordinator",
      });
      setRequest(updated);
      toast({ title: "🚫 Đã hủy yêu cầu" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message,
      });
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const handleClose = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await requestRepository.closeRequest(request._id);
      setRequest(updated);
      toast({ title: "📁 Đã đóng yêu cầu" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message,
      });
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!request) return;

    // Allow updating even if it's the same, so they can just "Confirm" the default Normal
    setIsUpdating(true);
    try {
      const updated = await requestRepository.updateRequestPriority(
        request._id,
        {
          priority: newPriority as any,
        },
      );
      setRequest(updated);
      toast({ title: "✅ Đã cập nhật mức độ ưu tiên" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật",
        description: err.message,
      });
      // Revert select on error
      if (document.getElementById("priority-select")) {
        (
          document.getElementById("priority-select") as HTMLSelectElement
        ).value = request.priority;
      }
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const confirmAction = () => {
    if (actionType === "verify") handleVerify();
    else if (actionType === "reject") handleReject();
    else if (actionType === "cancel") handleCancel();
    else if (actionType === "close") handleClose();
    else if (actionType === "set_priority")
      handlePriorityUpdate(selectedPriority);
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

  // ─── Location helpers ────────────────────────────────────

  const getLat = (req: CoordinatorRequest): number => {
    if (req.location?.coordinates) return req.location.coordinates[1];
    if (req.latitude) return req.latitude;
    return 0;
  };

  const getLng = (req: CoordinatorRequest): number => {
    if (req.location?.coordinates) return req.location.coordinates[0];
    if (req.longitude) return req.longitude;
    return 0;
  };

  const hasLocation = (req: CoordinatorRequest): boolean => {
    return !!(req.location?.coordinates || (req.latitude && req.longitude));
  };

  // ─── Render ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-300 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <p className="text-red-200 mb-4">
            ⚠️ {error || "Không tìm thấy yêu cầu"}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-4 py-2 rounded-lg font-bold"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = request.status === "SUBMITTED";
  const canClose = ["FULFILLED", "PARTIALLY_FULFILLED"].includes(
    request.status,
  );
  const canCancel = ["SUBMITTED", "VERIFIED"].includes(request.status);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-[#FF7700] transition-colors text-2xl"
            >
              ←
            </button>
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
                Chi tiết yêu cầu
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <span className="text-xs font-semibold text-white font-mono">
                  {request._id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Priority Selector & Status Badges */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold text-lg mb-4">
              Mức độ ưu tiên
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                id="priority-select"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  if (
                    request.status === "VERIFIED" ||
                    request.status === "IN_PROGRESS" ||
                    request.status === "PARTIALLY_FULFILLED"
                  ) {
                    handlePriorityUpdate(e.target.value);
                  }
                }}
                disabled={isUpdating || request.status === "SUBMITTED"}
                className={`bg-[#1a3a52] text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 ${request.status === "SUBMITTED" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="Critical">🔴 KHẨN CẤP</option>
                <option value="High">🟠 CAO</option>
                <option value="Normal">🔵 BÌNH THƯỜNG</option>
              </select>

              <div
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.Normal
                } ring-2 ring-offset-2 ring-offset-[#133249]`}
              >
                {PRIORITY_LABELS[request.priority] || request.priority}
              </div>
              <div
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  STATUS_COLORS[request.status] || "bg-gray-500 text-white"
                }`}
              >
                {request.status}
              </div>
              <div className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-500 text-white">
                {request.type === "Rescue" ? "🆘 Cứu hộ" : "📦 Cứu trợ"}
              </div>
              {request.isDuplicated && (
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  📎 Trùng lặp
                </div>
              )}
              {request.source && (
                <div className="px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-white/5">
                  Nguồn: {request.source}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">
              Thông tin người yêu cầu
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="text-gray-400 text-sm">Tên:</span>
                <p className="text-white font-bold text-lg">
                  {request.userName || request.displayName || "Ẩn danh"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Số người:</span>
                <p className="text-white font-bold text-lg">
                  👥 {request.peopleCount || "Chưa rõ"}
                </p>
              </div>
              {request.phoneNumber && (
                <div>
                  <span className="text-gray-400 text-sm">Điện thoại:</span>
                  <p className="text-white font-bold">
                    📞 {request.phoneNumber}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-400 text-sm">Thời gian gửi:</span>
                <p className="text-white font-bold">
                  🕐 {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-bold text-xl mb-3">Mô tả</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </section>

          {/* Location & Map */}
          {hasLocation(request) && (
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-3">📍 Vị trí & Kho gần nhất</h2>
              <p className="text-gray-300 mb-2">
                {resolvedAddress || "Đang lấy địa chỉ..."}
                {request.isLocationVerified && (
                  <span className="ml-2 text-green-400 text-sm">
                    ✓ Đã xác minh
                  </span>
                )}
              </p>
              <GoongRequestMap
                request={request}
                warehouses={warehouses}
                onLocationUpdate={async (lat, lng, address) => {
                  try {
                    const updated = await requestRepository.updateLocation(request._id, {
                      location: {
                        type: "Point",
                        coordinates: [lng, lat],
                      },
                      isLocationVerified: true,
                    });
                    setRequest(updated);
                    toast({
                      title: "✅ Đã cập nhật vị trí",
                      description: address,
                    });
                  } catch (err: any) {
                    toast({
                      title: "❌ Lỗi cập nhật vị trí",
                      description: err.message,
                      variant: "destructive",
                    });
                  }
                }}
                allowLocationUpdate={request.status === "VERIFIED" || request.status === "SUBMITTED"}
                height="500px"
              />
            </section>
          )}

          {/* Supplies */}
          {request.requestSupplies && request.requestSupplies.length > 0 && (
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">
                Vật tư yêu cầu
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {request.requestSupplies.map((supply, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="text-white font-bold">
                      {supply.supplyName || `Supply ${supply.supplyId}`}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Số lượng: {supply.requestedQty}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Media */}
          {request.media && request.media.length > 0 && (
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">Hình ảnh</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {request.media.map((m, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden border-2 border-white/20"
                  >
                    <img
                      src={m.secureUrl || m.imageUrl}
                      alt={m.description || `Media ${idx + 1}`}
                      className="w-full object-cover hover:scale-110 transition-transform"
                    />
                    {m.description && (
                      <p className="text-gray-400 text-xs p-2">
                        {m.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Buttons — SUBMITTED */}
          {isSubmitted && (
            <section className="bg-[#FF7700]/10 border border-[#FF7700]/30 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">Hành động</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setActionType("verify");
                    setShowConfirmDialog(true);
                  }}
                  disabled={isUpdating}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  ✅ Xác minh
                </button>
                <button
                  onClick={() => {
                    setActionType("reject");
                    setShowConfirmDialog(true);
                  }}
                  disabled={isUpdating}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  ❌ Từ chối
                </button>
                <button
                  onClick={() => {
                    setActionType("cancel");
                    setShowConfirmDialog(true);
                  }}
                  disabled={isUpdating}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🚫 Hủy yêu cầu
                </button>
              </div>
            </section>
          )}

          {/* Verified — Can go to missions */}
          {request.status === "VERIFIED" && (
            <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">
                Phân công đội cứu hộ
              </h2>
              <p className="text-gray-300 mb-4">
                Yêu cầu đã được xác minh. Bạn có thể tạo mission và phân công
                đội.
              </p>
              <button
                onClick={() => router.push("/mission-control")}
                className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                🚁 Đi tới Missions
              </button>
            </section>
          )}

          {/* Can Close */}
          {canClose && (
            <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">
                Đóng yêu cầu
              </h2>
              <p className="text-gray-300 mb-4">
                Yêu cầu đã được hoàn thành. Bạn có thể đóng yêu cầu này.
              </p>
              <button
                onClick={() => {
                  setActionType("close");
                  setShowConfirmDialog(true);
                }}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                📁 Đóng yêu cầu
              </button>
            </section>
          )}

          {/* Can Cancel (VERIFIED) */}
          {request.status === "VERIFIED" && (
            <section className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6">
              <button
                onClick={() => {
                  setActionType("cancel");
                  setShowConfirmDialog(true);
                }}
                disabled={isUpdating}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
              >
                🚫 Hủy yêu cầu
              </button>
            </section>
          )}
        </div>
      </main>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#1a3a52] rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-white font-bold text-xl mb-4">
              {actionType === "set_priority" ?
                "Thiết lập Mức độ Ưu tiên"
              : "Xác nhận hành động"}
            </h3>

            {actionType === "set_priority" ?
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Vui lòng chọn mức độ ưu tiên cho yêu cầu này:
                </p>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-[#1a3a52] text-white border border-white/20 rounded-lg p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                >
                  <option value="Critical">🔴 KHẨN CẤP</option>
                  <option value="High">🟠 CAO</option>
                  <option value="Normal">🔵 BÌNH THƯỜNG</option>
                </select>
              </div>
            : <p className="text-gray-300 mb-6">
                {actionType === "verify" &&
                  "Bạn có chắc muốn xác minh yêu cầu này?"}
                {actionType === "reject" &&
                  "Bạn có chắc muốn từ chối yêu cầu này?"}
                {actionType === "cancel" && "Bạn có chắc muốn hủy yêu cầu này?"}
                {actionType === "close" && "Bạn có chắc muốn đóng yêu cầu này?"}
              </p>
            }

            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={isUpdating}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${
                  actionType === "verify" || actionType === "set_priority" ?
                    "bg-green-500 hover:bg-green-600 text-white"
                  : actionType === "close" ?
                    "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isUpdating ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setActionType(null);
                }}
                disabled={isUpdating}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
