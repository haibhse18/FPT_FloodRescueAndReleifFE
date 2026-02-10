"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { MobileBottomNav, DesktopSidebar } from "@/shared/components/layout";
import { coordinatorRepository } from "@/modules/coordinator/infrastructure/coordinator.repository.impl";
import { UpdateRequestStatusUseCase } from "@/modules/coordinator/application/updateRequestStatus.usecase";
import { UpdateRequestPriorityUseCase } from "@/modules/coordinator/application/updateRequestPriority.usecase";
import { CoordinatorRequest } from "@/modules/coordinator/domain/request.entity";

const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  }
);

const updateRequestStatusUseCase = new UpdateRequestStatusUseCase(
  coordinatorRepository
);
const updateRequestPriorityUseCase = new UpdateRequestPriorityUseCase(
  coordinatorRepository
);

interface Props {
  params: { id: string };
}

// Priority colors
const PRIORITY_COLORS = {
  critical: "bg-red-500 text-white ring-red-500",
  high: "bg-[#FF7700] text-white ring-[#FF7700]",
  normal: "bg-yellow-500 text-white ring-yellow-500",
} as const;

const PRIORITY_LABELS = {
  critical: "🔴 KHẨN CẤP",
  high: "🟠 CAO",
  normal: "🟡 BÌNH THƯỜNG",
} as const;

export default function CoordinatorRequestDetailPage({ params }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState<CoordinatorRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "verify" | "spam" | "reject" | null
  >(null);
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  useEffect(() => {
    fetchRequestDetail();
  }, [params.id]);

  const fetchRequestDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await coordinatorRepository.getRequestDetail(params.id);
      setSelectedPriority(data.priority); // Set initial priority
      setRequest(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin yêu cầu");
      console.error("Error fetching request detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!request) return;

    setIsUpdating(true);
    try {
      await updateRequestStatusUseCase.execute(request.requestId, newStatus);

      // Show success and refresh
      alert(
        `✅ Đã cập nhật trạng thái thành: ${newStatus === "Verified" ? "Đã xác minh" : newStatus === "Spam" ? "Spam" : "Từ chối"}`
      );

      // Refresh data
      await fetchRequestDetail();
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message || "Không thể cập nhật trạng thái"}`);
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!request || newPriority === request.priority) return;

    setIsUpdating(true);
    try {
      await updateRequestPriorityUseCase.execute(request.requestId, newPriority);

      // Show success and refresh
      alert(`✅ Đã cập nhật mức độ ưu tiên`);

      // Refresh data
      await fetchRequestDetail();
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message || "Không thể cập nhật mức độ ưu tiên"}`);
      console.error("Error updating priority:", err);
      // Reset to original priority
      setSelectedPriority(request.priority);
    } finally {
      setIsUpdating(false);
    }
  };

  const openConfirmDialog = (action: "verify" | "spam" | "reject") => {
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (actionType === "verify") {
      handleStatusUpdate("Verified");
    } else if (actionType === "spam") {
      handleStatusUpdate("Spam");
    } else if (actionType === "reject") {
      handleStatusUpdate("Rejected");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#133249] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-300 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#133249] flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Fixed Header */}
        <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white hover:text-[#FF7700] transition-colors text-2xl"
                aria-label="Quay lại"
              >
                ←
              </button>
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight uppercase">
                  Chi tiết yêu cầu
                </h1>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                  <span className="text-xs font-semibold text-white">
                    ID: {request.requestId.slice(0, 8)}...
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
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    handlePriorityUpdate(e.target.value);
                  }}
                  disabled={isUpdating}
                  className="bg-[#1a3a52] text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="critical">🔴 KHẨN CẤP</option>
                  <option value="high">🟠 CAO</option>
                  <option value="normal">🟡 BÌNH THƯỜNG</option>
                </select>

                <div
                  className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    PRIORITY_COLORS[request.priority]
                  } ring-2 ring-offset-2 ring-offset-[#133249]`}
                >
                  {PRIORITY_LABELS[request.priority]}
                </div>
                <div className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-500 text-white">
                  {request.status}
                </div>
                <div className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-500 text-white">
                  {request.type === "Rescue" ? "🆘 Cứu hộ" : "📦 Cứu trợ"}
                </div>
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
                    {request.displayName || request.userName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Số người:</span>
                  <p className="text-white font-bold text-lg">
                    👥 {request.peopleCount || "Chưa rõ"}
                  </p>
                </div>
                <div className="lg:col-span-2">
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
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-xl mb-3">Vị trí</h2>
              <p className="text-gray-300 mb-4">
                📍 {request.address || "Chưa có địa chỉ"}
              </p>
              <p className="text-gray-400 text-sm mb-4 font-mono">
                Lat: {request.latitude.toFixed(6)} • Long:{" "}
                {request.longitude.toFixed(6)}
              </p>
              <div className="h-96 rounded-lg overflow-hidden border-2 border-white/20">
                <OpenMap
                  latitude={request.latitude}
                  longitude={request.longitude}
                  address={request.address || "Vị trí yêu cầu"}
                />
              </div>
            </section>

            {/* Supplies Requested */}
            {request.requestSupply && request.requestSupply.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-bold text-xl mb-4">
                  Vật tư yêu cầu
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {request.requestSupply.map((supply, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="text-white font-bold">
                        {supply.supplyName || `Supply ${supply.supplyId}`}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Số lượng: {supply.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Images */}
            {request.imageUrls && request.imageUrls.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-bold text-xl mb-4">Hình ảnh</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {request.imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-white/20"
                    >
                      <img
                        src={url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action Buttons */}
            {request.status === "Submitted" && (
              <section className="bg-[#FF7700]/10 border border-[#FF7700]/30 rounded-xl p-6">
                <h2 className="text-white font-bold text-xl mb-4">
                  Hành động
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => openConfirmDialog("verify")}
                    disabled={isUpdating}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500/50 flex items-center justify-center gap-2"
                  >
                    ✅ Xác minh
                  </button>
                  <button
                    onClick={() => openConfirmDialog("spam")}
                    disabled={isUpdating}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-500/50 flex items-center justify-center gap-2"
                  >
                    🚫 Đánh dấu Spam
                  </button>
                  <button
                    onClick={() => openConfirmDialog("reject")}
                    disabled={isUpdating}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-500/50 flex items-center justify-center gap-2"
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </section>
            )}

            {/* Verified - Can Assign */}
            {request.status === "Verified" && (
              <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-white font-bold text-xl mb-4">
                  Phân công đội cứu hộ
                </h2>
                <p className="text-gray-300 mb-4">
                  Yêu cầu đã được xác minh. Bạn có thể phân công đội cứu hộ cho
                  yêu cầu này.
                </p>
                <button
                  onClick={() =>
                    router.push(`/coordinator/missions/create?requestId=${request.requestId}`)
                  }
                  className="bg-[#FF7700] hover:bg-[#FF8820] text-white px-6 py-3 rounded-xl font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#FF7700]/50"
                >
                  🚁 Phân công đội
                </button>
              </section>
            )}
          </div>
        </main>

        <MobileBottomNav currentPath="/coordinator/requests" />
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#1a3a52] rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-white font-bold text-xl mb-4">
              Xác nhận hành động
            </h3>
            <p className="text-gray-300 mb-6">
              {actionType === "verify" &&
                "Bạn có chắc muốn xác minh yêu cầu này? Yêu cầu sẽ được chuyển sang trạng thái 'Đã xác minh'."}
              {actionType === "spam" &&
                "Bạn có chắc đây là spam? Yêu cầu sẽ bị đánh dấu là Spam và không được xử lý."}
              {actionType === "reject" &&
                "Bạn có chắc muốn từ chối yêu cầu này? Yêu cầu sẽ không được xử lý."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={isUpdating}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === "verify"
                    ? "bg-green-500 hover:bg-green-600 text-white"
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
