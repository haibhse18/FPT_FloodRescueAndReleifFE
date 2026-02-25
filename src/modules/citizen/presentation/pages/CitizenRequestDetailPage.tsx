"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

const OpenMap = dynamic(
    () => import("@/modules/map/presentation/components/OpenMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-slate-700 rounded-lg animate-pulse flex items-center justify-center text-slate-400 text-sm">
                Đang tải bản đồ...
            </div>
        ),
    },
);

interface Props {
    id: string;
}

/**
 * Swagger status lifecycle (forward path):
 * SUBMITTED(0) → VERIFIED(1) → IN_PROGRESS(2) → PARTIALLY_FULFILLED(3) → FULFILLED(4) → CLOSED(5)
 * Terminal failures: REJECTED(-1) | CANCELLED(-1)
 */
const STATUS_META: Record<
    string,
    { label: string; color: string; icon: string; step: number }
> = {
    // ── Canonical UPPERCASE enum per swagger ──
    SUBMITTED: {
        label: "Đã gửi",
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: "⏳",
        step: 0,
    },
    VERIFIED: {
        label: "Đã xác nhận",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: "✅",
        step: 1,
    },
    IN_PROGRESS: {
        label: "Đang xử lý",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        icon: "🚀",
        step: 2,
    },
    PARTIALLY_FULFILLED: {
        label: "Đang cứu trợ",
        color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        icon: "📦",
        step: 3,
    },
    FULFILLED: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: "🎉",
        step: 4,
    },
    CLOSED: {
        label: "Đã đóng",
        color: "bg-green-700/20 text-green-400 border-green-700/30",
        icon: "🔒",
        step: 5,
    },
    REJECTED: {
        label: "Bị từ chối",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: "❌",
        step: -1,
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: "🚫",
        step: -1,
    },
    // ── Legacy / mixed-case fallbacks ──
    Pending: { label: "Đã gửi", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: "⏳", step: 0 },
    Submitted: { label: "Đã gửi", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: "⏳", step: 0 },
    Accepted: { label: "Đã xác nhận", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "✅", step: 1 },
    Verified: { label: "Đã xác nhận", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "✅", step: 1 },
    "In Progress": { label: "Đang xử lý", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: "🚀", step: 2 },
    Completed: { label: "Hoàn thành", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: "🎉", step: 4 },
    Fulfilled: { label: "Hoàn thành", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: "🎉", step: 4 },
    Rejected: { label: "Bị từ chối", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: "❌", step: -1 },
    Cancelled: { label: "Đã hủy", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: "🚫", step: -1 },
};

const URGENCY_META: Record<string, { label: string; color: string }> = {
    // Backend enum (Title Case) per swagger: Critical | High | Normal
    Critical: { label: "Nguy kịch", color: "bg-red-500/20 text-red-300 border-red-500/30" },
    High: { label: "Cao", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    Normal: { label: "Bình thường", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    // Legacy lowercase fallbacks
    critical: { label: "Nguy kịch", color: "bg-red-500/20 text-red-300 border-red-500/30" },
    high: { label: "Cao", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    normal: { label: "Bình thường", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    medium: { label: "Trung bình", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    low: { label: "Thấp", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

const TYPE_LABELS: Record<string, string> = {
    // Lowercase (legacy)
    flood: "🌊 Lũ lụt",
    trapped: "🆘 Mắc kẹt",
    injury: "🩹 Chấn thương",
    landslide: "⛰️ Sạt lở",
    other: "⚠️ Khác",
    // Backend enum values (capitalized)
    Flood: "🌊 Lũ lụt",
    Trapped: "🆘 Mắc kẹt",
    Injured: "🩹 Chấn thương",
    Injury: "🩹 Chấn thương",
    Landslide: "⛰️ Sạt lở",
    Other: "⚠️ Khác",
    // Request type
    Rescue: "🚁 Cứu hộ",
    rescue: "🚁 Cứu hộ",
    Relief: "📦 Cứu trợ",
    relief: "📦 Cứu trợ",
};

// 6 steps matching the swagger status lifecycle:
// SUBMITTED(0) → VERIFIED(1) → IN_PROGRESS(2) → PARTIALLY_FULFILLED(3) → FULFILLED(4) → CLOSED(5)
const STEPS = [
    "Đã gửi",        // 0 — SUBMITTED
    "Xác nhận",      // 1 — VERIFIED
    "Đang xử lý",   // 2 — IN_PROGRESS
    "Đang cứu trợ", // 3 — PARTIALLY_FULFILLED
    "Hoàn thành",   // 4 — FULFILLED
    "Đã đóng",      // 5 — CLOSED
];

function formatDate(dateStr: string | Date) {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function CitizenRequestDetailPage({ id }: Props) {
    const router = useRouter();
    const [request, setRequest] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const [actionLoading, setActionLoading] = useState<"cancel" | "confirm" | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await requestRepository.getRequestDetail(id);
            setRequest(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải thông tin yêu cầu");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Lightbox helpers ─── */
    const openLightbox = useCallback((i: number) => {
        setImgLoaded(false);
        setLightboxIndex(i);
    }, []);

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const goPrev = useCallback(() =>
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? (setImgLoaded(false), prev - 1) : prev)), []);

    const goNext = useCallback((total: number) =>
        setLightboxIndex((prev) => (prev !== null && prev < total - 1 ? (setImgLoaded(false), prev + 1) : prev)), []);

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext(images.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxIndex]);

    // Lock body scroll when lightbox open
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightboxIndex]);

    const handleCancel = async () => {
        if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này không?")) return;
        setActionLoading("cancel");
        try {
            await requestRepository.cancelRequest(id);
            setRequest((prev: any) => ({ ...prev, status: "CANCELLED" }));
            setActionSuccess("Yêu cầu đã được hủy thành công.");
        } catch (err: any) {
            alert(`❌ ${err?.response?.data?.message || err.message || "Không thể hủy yêu cầu"}`);
        } finally {
            setActionLoading(null);
        }
    };

    /* ─── Loading skeleton ─── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#133249] p-4 space-y-4 animate-pulse">
                <div className="h-12 bg-white/10 rounded-xl" />
                <div className="h-32 bg-white/10 rounded-xl" />
                <div className="h-48 bg-white/10 rounded-xl" />
                <div className="h-40 bg-white/10 rounded-xl" />
            </div>
        );
    }

    /* ─── Error state ─── */
    if (error || !request) {
        return (
            <div className="min-h-screen bg-[#133249] flex flex-col items-center justify-center p-6 gap-4">
                <span className="text-5xl">😞</span>
                <p className="text-white font-bold text-xl text-center">
                    {error || "Không tìm thấy yêu cầu"}
                </p>
                <p className="text-gray-400 text-sm text-center">
                    Yêu cầu có thể đã bị xóa hoặc bạn không có quyền xem.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={fetchDetail}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                    >
                        Thử lại
                    </button>
                    <Link
                        href="/history"
                        className="px-4 py-2 bg-[#FF7700] hover:bg-[#FF8800] text-white rounded-xl font-bold transition-all"
                    >
                        ← Quay lại lịch sử
                    </Link>
                </div>
            </div>
        );
    }

    const statusKey = request.status || "Submitted";
    const meta = STATUS_META[statusKey] || STATUS_META["Submitted"];
    const urgencyMeta =
        URGENCY_META[request.priority || request.urgencyLevel || "normal"] || URGENCY_META["normal"];
    const currentStep = meta.step;
    const shortId = (request._id || request.requestId || request.id || "").slice(-8).toUpperCase();
    // Images: backend stores in media[].imageUrl (swagger) OR legacy imageUrls[]
    const images: string[] =
        request.imageUrls?.length > 0 ? request.imageUrls :
            request.images?.length > 0 ? request.images :
                Array.isArray(request.media)
                    ? (request.media as any[]).map((m) => m?.imageUrl || m?.url || "").filter(Boolean)
                    : Array.isArray(request.requestMedia)
                        ? (request.requestMedia as any[]).map((m) => m?.url || m?.fileUrl || m?.imageUrl || (typeof m === "string" ? m : "")).filter(Boolean)
                        : [];

    // Parse location: backend trả về GeoJSON { type:"Point", coordinates:[lon,lat] }
    const parsedLoc = (() => {
        const loc = request.location;
        if (!loc) return null;
        if (typeof loc === "string") return { lat: null as number | null, lon: null as number | null, text: loc };
        if (loc.type === "Point" && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
            const [lon, lat] = loc.coordinates as [number, number];
            return { lat, lon, text: `${lat.toFixed(5)}, ${lon.toFixed(5)}` };
        }
        return null;
    })();
    const mapLat: number | null = parsedLoc?.lat ?? request.latitude ?? null;
    const mapLon: number | null = parsedLoc?.lon ?? request.longitude ?? null;
    const locationText: string | null = parsedLoc?.text ?? (mapLat != null ? `${(mapLat as number).toFixed(5)}, ${(mapLon as number).toFixed(5)}` : null);

    return (
        <div className="min-h-screen bg-[#133249] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0f2a3f]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                    ←
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-black text-lg text-white leading-tight">
                        Yêu cầu #{shortId}
                    </h1>
                    <p className="text-gray-400 text-xs truncate">
                        {TYPE_LABELS[request.incidentType || request.type] || request.incidentType || request.type} ·{" "}
                        {formatDate(request.createdAt)}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full border text-xs font-bold ${meta.color}`}
                >
                    {meta.icon} {meta.label}
                </span>
            </header>

            <main className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
                {/* Progress Steps */}
                {currentStep >= 0 && (
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
                            Tiến trình xử lý
                        </p>
                        <div className="flex items-center">
                            {STEPS.map((step, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div className="relative w-full flex items-center justify-center">
                                        {idx > 0 && (
                                            <div
                                                className={`absolute right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full ${idx <= currentStep ? "bg-green-400" : "bg-white/10"
                                                    }`}
                                            />
                                        )}
                                        <div
                                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${idx < currentStep
                                                ? "bg-green-500 border-green-400 text-white"
                                                : idx === currentStep
                                                    ? "bg-[#FF7700] border-[#FF7700] text-white ring-4 ring-[#FF7700]/20"
                                                    : "bg-white/5 border-white/20 text-gray-500"
                                                }`}
                                        >
                                            {idx < currentStep ? "✓" : idx + 1}
                                        </div>
                                    </div>
                                    <p
                                        className={`mt-1.5 text-[10px] font-bold text-center leading-tight ${idx === currentStep
                                            ? "text-[#FF7700]"
                                            : idx < currentStep
                                                ? "text-green-400"
                                                : "text-gray-500"
                                            }`}
                                    >
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rejected / Cancelled notice */}
                {currentStep === -1 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                            <p className="text-red-300 font-bold">
                                Yêu cầu {meta.label.toLowerCase()}
                            </p>
                            <p className="text-red-400/80 text-sm mt-0.5">
                                {request.rejectionReason ||
                                    "Vui lòng liên hệ hỗ trợ để biết thêm thông tin."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Basic info card */}
                <div className="bg-black/20 border border-white/10 rounded-xl divide-y divide-white/5">
                    <div className="px-4 py-3">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            Thông tin yêu cầu
                        </p>
                    </div>

                    {/* Type */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Loại sự cố</span>
                        <span className="text-white font-bold text-sm">
                            {TYPE_LABELS[request.incidentType || request.type] || request.incidentType || request.type || "—"}
                        </span>
                    </div>

                    {/* Urgency */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Mức độ khẩn cấp</span>
                        <span
                            className={`px-2 py-0.5 rounded-full border text-xs font-bold ${urgencyMeta.color}`}
                        >
                            {urgencyMeta.label}
                        </span>
                    </div>

                    {/* People */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Số người cần cứu</span>
                        <span className="text-white font-bold text-sm">
                            {request.numberOfPeople || request.peopleCount || 1} người
                        </span>
                    </div>

                    {/* Created */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Thời gian gửi</span>
                        <span className="text-white text-sm">
                            {formatDate(request.createdAt)}
                        </span>
                    </div>

                    {/* Updated */}
                    {request.updatedAt && (
                        <div className="px-4 py-3 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Cập nhật lần cuối</span>
                            <span className="text-white text-sm">
                                {formatDate(request.updatedAt)}
                            </span>
                        </div>
                    )}

                    {/* Request ID */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Mã yêu cầu</span>
                        <span className="text-gray-300 text-xs font-mono">
                            ...{shortId}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {request.description && (
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-2">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            Mô tả tình huống
                        </p>
                        <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                            {request.description}
                        </p>
                    </div>
                )}

                {/* Location + Map */}
                {(locationText || (mapLat !== null && mapLon !== null)) && (
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            📍 Vị trí
                        </p>
                        {locationText && (
                            <p className="text-gray-100 text-sm">{locationText}</p>
                        )}
                        {mapLat !== null && mapLon !== null && (
                            <div className="h-48 rounded-xl overflow-hidden border border-white/10">
                                <OpenMap
                                    latitude={mapLat}
                                    longitude={mapLon}
                                    address={locationText || "Vị trí yêu cầu"}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            📸 Hình ảnh hiện trường ({images.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((url: string, i: number) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openLightbox(i)}
                                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#FF7700]/60 transition-all group focus:outline-none focus:ring-2 focus:ring-[#FF7700]"
                                    aria-label={`Xem ảnh ${i + 1}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Ảnh hiện trường ${i + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {/* overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                                        <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg">🔍</span>
                                    </div>
                                    {/* index badge */}
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                        {i + 1}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {actionSuccess ? (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold">
                        <span className="text-xl">✅</span>
                        <span>{actionSuccess}</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Cancel: SUBMITTED status — citizen can cancel via PATCH /requests/{id}/cancel */}
                        {["SUBMITTED", "Submitted", "Pending", "PENDING"].includes(request.status) && (
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading !== null}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === "cancel" ? (
                                    <><div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Đang hủy...</>
                                ) : (
                                    <>🚫 Hủy yêu cầu này</>
                                )}
                            </button>
                        )}

                        {/* No citizen confirm endpoint in swagger — show info when FULFILLED */}
                        {["FULFILLED", "PARTIALLY_FULFILLED", "Fulfilled", "Completed"].includes(request.status) && (
                            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm">
                                <span className="text-lg leading-none mt-0.5">ℹ️</span>
                                <span>Yêu cầu đã được xử lý. Điều phối viên sẽ đóng yêu cầu khi hoàn tất sàn lọc.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Back to history button */}
                <Link
                    href="/history"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-bold text-sm transition-all"
                >
                    ← Quay lại lịch sử yêu cầu
                </Link>
            </main>

            {/* ─── Lightbox ─── */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] flex flex-col"
                    style={{ background: "rgba(0,0,0,0.95)" }}
                    // touch swipe
                    onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={(e) => {
                        if (touchStartX.current === null) return;
                        const delta = e.changedTouches[0].clientX - touchStartX.current;
                        if (delta > 60) goPrev();
                        else if (delta < -60) goNext(images.length);
                        touchStartX.current = null;
                    }}
                >
                    {/* ── Top bar ── */}
                    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                        <span className="text-white/70 text-sm font-medium">
                            📸 {lightboxIndex + 1} / {images.length}
                        </span>
                        <button
                            onClick={closeLightbox}
                            className="w-9 h-9 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors"
                            aria-label="Đóng"
                        >
                            ✕
                        </button>
                    </div>

                    {/* ── Image area ── */}
                    <div
                        className="flex-1 flex items-center justify-center px-2 relative min-h-0"
                        onClick={closeLightbox}
                    >
                        {/* Prev */}
                        {lightboxIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors shadow-lg"
                                aria-label="Ảnh trước"
                            >
                                ‹
                            </button>
                        )}

                        {/* Loading spinner */}
                        {!imgLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        )}

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            key={lightboxIndex}
                            src={images[lightboxIndex]}
                            alt={`Ảnh hiện trường ${lightboxIndex + 1}`}
                            onLoad={() => setImgLoaded(true)}
                            onClick={(e) => e.stopPropagation()}
                            className={`max-w-full max-h-full object-contain rounded-xl select-none transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0"
                                }`}
                            style={{ maxHeight: "calc(100vh - 180px)" }}
                            draggable={false}
                        />

                        {/* Next */}
                        {lightboxIndex < images.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(images.length); }}
                                className="absolute right-2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors shadow-lg"
                                aria-label="Ảnh tiếp"
                            >
                                ›
                            </button>
                        )}
                    </div>

                    {/* ── Thumbnail strip ── */}
                    {images.length > 1 && (
                        <div className="flex-shrink-0 px-4 py-3 flex gap-2 justify-center overflow-x-auto">
                            {images.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => openLightbox(i)}
                                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex
                                        ? "border-[#FF7700] scale-110 shadow-lg shadow-orange-500/30"
                                        : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                                        }`}
                                    aria-label={`Chuyển sang ảnh ${i + 1}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Hint ── */}
                    <p className="text-center text-white/30 text-xs pb-3 flex-shrink-0">
                        Bấm ngoài ảnh để đóng · Phím ← → để chuyển · Vuốt để lướt
                    </p>
                </div>
            )}
        </div>
    );
}
