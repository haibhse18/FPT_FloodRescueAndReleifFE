"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
    FiAlertTriangle,
    FiArrowLeft,
    FiCheck,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiImage,
    FiMapPin,
    FiSearch,
    FiSlash,
    FiTruck,
    FiX,
    FiXCircle,
} from "react-icons/fi";

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

const STATUS_META: Record<
    string,
    { label: string; color: string; icon: IconType; step: number }
> = {
    // Backend enum: Pending | Accepted | In Progress | Completed | Rejected | Cancelled
    Pending: {
        label: "Chờ xử lý",
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: FiClock,
        step: 0,
    },
    SUBMITTED: {
        label: "Chờ xử lý",
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: FiClock,
        step: 0,
    },
    // Legacy / fallback alias
    Submitted: {
        label: "Chờ xử lý",
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: FiClock,
        step: 0,
    },
    VERIFIED: {
        label: "Đã tiếp nhận",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: FiCheckCircle,
        step: 1,
    },
    Accepted: {
        label: "Đã chấp nhận",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: FiCheckCircle,
        step: 1,
    },
    IN_PROGRESS: {
        label: "Đang xử lý",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        icon: FiTruck,
        step: 2,
    },
    "In Progress": {
        label: "Đang xử lý",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        icon: FiTruck,
        step: 2,
    },
    FULFILLED: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: FiCheckCircle,
        step: 3,
    },
    PARTIALLY_FULFILLED: {
        label: "Hoàn thành một phần",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: FiCheckCircle,
        step: 3,
    },
    CLOSED: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: FiCheckCircle,
        step: 3,
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: FiCheckCircle,
        step: 3,
    },
    Completed: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: FiCheckCircle,
        step: 3,
    },
    REJECTED: {
        label: "Bị từ chối",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: FiXCircle,
        step: -1,
    },
    Rejected: {
        label: "Bị từ chối",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: FiXCircle,
        step: -1,
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: FiSlash,
        step: -1,
    },
    Cancelled: {
        label: "Đã hủy",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: FiSlash,
        step: -1,
    },
};

const URGENCY_META: Record<string, { label: string; color: string }> = {
    // Backend enum: critical | high | normal
    critical: {
        label: "Nguy kịch",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
    },
    high: {
        label: "Cao",
        color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    },
    normal: {
        label: "Bình thường",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    // Legacy/fallback values
    medium: {
        label: "Trung bình",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    },
    low: {
        label: "Thấp",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
};

const TYPE_META: Record<string, { label: string; icon: IconType }> = {
    // Lowercase (legacy)
    flood: { label: "Lũ lụt", icon: FiAlertTriangle },
    trapped: { label: "Mắc kẹt", icon: FiAlertTriangle },
    injury: { label: "Chấn thương", icon: FiAlertTriangle },
    landslide: { label: "Sạt lở", icon: FiAlertTriangle },
    other: { label: "Khác", icon: FiAlertTriangle },
    // Backend enum values (capitalized)
    Flood: { label: "Lũ lụt", icon: FiAlertTriangle },
    Trapped: { label: "Mắc kẹt", icon: FiAlertTriangle },
    Injured: { label: "Chấn thương", icon: FiAlertTriangle },
    Injury: { label: "Chấn thương", icon: FiAlertTriangle },
    Landslide: { label: "Sạt lở", icon: FiAlertTriangle },
    Other: { label: "Khác", icon: FiAlertTriangle },
    // Request type
    Rescue: { label: "Cứu hộ", icon: FiTruck },
    rescue: { label: "Cứu hộ", icon: FiTruck },
    Relief: { label: "Cứu trợ", icon: FiImage },
    relief: { label: "Cứu trợ", icon: FiImage },
};

const STEPS = ["Đã gửi", "Chấp nhận", "Đang xử lý", "Hoàn thành"];

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
    const [actionLoading, setActionLoading] = useState<"cancel" | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [detailedAddress, setDetailedAddress] = useState<string | null>(null);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [noticeModal, setNoticeModal] = useState<{
        title: string;
        description: string;
    } | null>(null);

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

    // Fetch detailed address when request is loaded
    useEffect(() => {
        if (!request) return;

        // Parse coordinates from location
        let lat: number | null = null;
        let lon: number | null = null;

        if (request.location?.type === "Point" && Array.isArray(request.location.coordinates)) {
            const [lng, latitude] = request.location.coordinates as [number, number];
            lat = latitude;
            lon = lng;
        } else if (request.latitude && request.longitude) {
            lat = request.latitude;
            lon = request.longitude;
        }

        // Fetch detailed address if coordinates exist and address not already set
        if (lat && lon && !detailedAddress && !request.address) {
            fetchDetailedAddress(lat, lon);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request]);

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

    // Fetch detailed address from coordinates using reverse geocoding
    const fetchDetailedAddress = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `/api/reverse-geocode?lat=${lat}&lon=${lon}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.display_name) {
                    // Format address from display_name
                    const parts = (data.display_name as string)
                        .split(',')
                        .map((p: string) => p.trim())
                        .slice(0, -1) // Remove country
                        .filter((p: string) => p && !p.match(/^\d+$/)); // Remove postal codes
                    setDetailedAddress(parts.slice(0, 5).join(', ')); // Keep first 5 parts
                }
            }
        } catch (err) {
            // Silently fail - will use default address
        }
    };

    const executeCancelRequest = async () => {
        setActionLoading("cancel");
        try {
            await requestRepository.cancelRequest(id, {
                reason: "Hủy bởi người dùng",
            });
            setRequest((prev: any) => ({ ...prev, status: "CANCELLED" }));
            setActionSuccess("Yêu cầu đã được hủy thành công.");
        } catch (err: any) {
            const rawMessage =
                err?.response?.data?.message || err?.message || "Không thể hủy yêu cầu";
            const isVerifiedCancelError =
                /cannot cancel request in verified status/i.test(String(rawMessage)) ||
                /only submitted requests can be cancelled/i.test(String(rawMessage));

            setNoticeModal(
                isVerifiedCancelError
                    ? {
                        title: "Không thể hủy yêu cầu",
                        description:
                            "Yêu cầu đã được điều phối viên tiếp nhận nên không thể hủy nữa. Vui lòng theo dõi tiến trình xử lý hoặc liên hệ điều phối viên nếu cần hỗ trợ thêm.",
                    }
                    : {
                        title: "Hủy yêu cầu thất bại",
                        description: String(rawMessage),
                    },
            );
        } finally {
            setActionLoading(null);
            setIsCancelConfirmOpen(false);
        }
    };

    const handleCancelRequest = () => {
        setIsCancelConfirmOpen(true);
    };

    /* ─── Loading skeleton ─── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent p-5 lg:p-8 space-y-5 animate-pulse">
                <div className="h-14 lg:h-16 bg-white/10 rounded-xl" />
                <div className="h-36 lg:h-44 bg-white/10 rounded-xl" />
                <div className="h-56 lg:h-72 bg-white/10 rounded-xl" />
                <div className="h-44 lg:h-56 bg-white/10 rounded-xl" />
            </div>
        );
    }

    /* ─── Error state ─── */
    if (error || !request) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-8 gap-5">
                <FiAlertTriangle className="text-6xl text-red-300" />
                <p className="text-white font-bold text-2xl text-center">
                    {error || "Không tìm thấy yêu cầu"}
                </p>
                <p className="text-gray-400 text-base text-center max-w-2xl">
                    Yêu cầu có thể đã bị xóa hoặc bạn không có quyền xem.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={fetchDetail}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-base transition-all"
                    >
                        Thử lại
                    </button>
                    <Link
                        href="/history"
                        className="px-5 py-3 bg-[#FF7700] hover:bg-[#FF8800] text-white rounded-xl font-bold text-base transition-all"
                    >
                        ← Quay lại lịch sử
                    </Link>
                </div>
            </div>
        );
    }

    const statusKey = request.status || "Submitted";
    const meta = STATUS_META[statusKey] || STATUS_META["Submitted"];
    const StatusIcon = meta.icon;
    const urgencyMeta =
        URGENCY_META[request.priority || request.urgencyLevel || "normal"] || URGENCY_META["normal"];
    const currentStep = meta.step;

    const shortId = (request._id || request.requestId || request.id || "").slice(-8).toUpperCase();
    // Images: new Cloudinary architecture uses media[].secureUrl
    const images: string[] =
        Array.isArray(request.media) && request.media.length > 0
            ? (request.media as any[]).map((m) => m?.secureUrl || m?.imageUrl || "").filter(Boolean)
            : request.images?.length > 0 ? request.images
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
    // Prioritize detailed address from reverse geocoding, then backend address
    const locationText: string | null = detailedAddress ?? request.address ?? parsedLoc?.text ?? (mapLat != null ? `${(mapLat as number).toFixed(5)}, ${(mapLon as number).toFixed(5)}` : null);
    const canCancelRequest = ["Pending", "PENDING", "pending", "Submitted", "SUBMITTED"].includes(request.status);
    const typeRaw = request.incidentType || request.type;
    const typeMeta = TYPE_META[typeRaw] || { label: typeRaw || "—", icon: FiAlertTriangle };
    const TypeIcon = typeMeta.icon;

    return (
        <div className="min-h-screen bg-transparent text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0f2a3f]/95 backdrop-blur-md border-b border-white/10 px-5 lg:px-8 py-4 lg:py-5 flex items-center gap-4">
                    <button
                    onClick={() => router.back()}
                    className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-lg transition-all"
                >
                        <FiArrowLeft />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-black text-xl lg:text-2xl text-white leading-tight">
                        Yêu cầu #{shortId}
                    </h1>
                    <p className="text-gray-400 text-sm truncate inline-flex items-center gap-1.5">
                        <TypeIcon className="inline-block" />
                        <span>{typeMeta.label} ·{" "}
                        {formatDate(request.createdAt)}
                        </span>
                    </p>
                </div>
                <span
                    className={`px-4 py-1.5 rounded-full border text-sm font-bold inline-flex items-center gap-1.5 ${meta.color}`}
                >
                    <StatusIcon /> {meta.label}
                </span>
            </header>

            <main className="p-5 lg:p-8 space-y-5 lg:space-y-6 max-w-5xl mx-auto pb-24 lg:pb-28">
                {/* Progress Steps with Timeline Info */}
                {currentStep >= 0 && (
                    <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl p-5 lg:p-6">
                        <p className="text-gray-400 text-sm font-bold mb-5 uppercase tracking-wider">
                            Tiến trình xử lý
                        </p>
                        <div className="flex items-stretch">
                            {STEPS.map((step, idx) => {
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div className="relative w-full flex items-center justify-center">
                                            {idx > 0 && (
                                                <div
                                                    className={`absolute right-1/2 top-1/2 -translate-y-1/2 h-1 w-full ${idx <= currentStep ? "bg-green-400" : "bg-white/10"
                                                        }`}
                                                />
                                            )}
                                            <div
                                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all ${idx < currentStep
                                                    ? "bg-green-500 border-green-400 text-white"
                                                    : idx === currentStep
                                                        ? "bg-[#FF7700] border-[#FF7700] text-white ring-4 ring-[#FF7700]/20"
                                                        : "bg-white/5 border-white/30 text-gray-300"
                                                    }`}
                                            >
                                                {idx < currentStep ? <FiCheck className="text-xs" /> : idx + 1}
                                            </div>
                                        </div>
                                        <p
                                            className={`mt-3 text-xs font-bold text-center leading-tight ${idx === currentStep
                                                ? "text-[#FF7700]"
                                                : idx < currentStep
                                                    ? "text-green-400"
                                                    : "text-gray-500"
                                                }`}
                                        >
                                            {step}
                                        </p>
                                        {idx === 0 && request?.createdAt && (
                                            <div className="mt-2 text-center">
                                                <p className="text-[10px] text-gray-400 mt-0.5 max-w-[120px] leading-tight">
                                                    {formatDate(request.createdAt)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rejected / Cancelled notice */}
                {currentStep === -1 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 lg:p-6 flex items-start gap-4">
                        <StatusIcon className="text-3xl" />
                        <div>
                            <p className="text-red-300 font-bold text-lg">
                                Yêu cầu {meta.label.toLowerCase()}
                            </p>
                            <p className="text-red-400/80 text-base mt-1">
                                {request.rejectionReason ||
                                    "Vui lòng liên hệ hỗ trợ để biết thêm thông tin."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Basic info card */}
                <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl divide-y divide-white/10">
                    <div className="px-5 lg:px-6 py-4">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
                            Thông tin yêu cầu
                        </p>
                    </div>

                    {/* Type */}
                    <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                        <span className="text-gray-400 text-base">Loại sự cố</span>
                        <span className="text-white font-bold text-base lg:text-lg">
                            <span className="inline-flex items-center gap-1.5">
                                <TypeIcon />
                                {typeMeta.label}
                            </span>
                        </span>
                    </div>

                    {/* Urgency */}
                    <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                        <span className="text-gray-400 text-base">Mức độ khẩn cấp</span>
                        <span
                            className={`px-3 py-1 rounded-full border text-sm font-bold ${urgencyMeta.color}`}
                        >
                            {urgencyMeta.label}
                        </span>
                    </div>

                    {/* People */}
                    <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                        <span className="text-gray-400 text-base">Số người cần cứu</span>
                        <span className="text-white font-bold text-base lg:text-lg">
                            {request.numberOfPeople || request.peopleCount || 1} người
                        </span>
                    </div>

                    {/* Created */}
                    <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                        <span className="text-gray-400 text-base">Thời gian gửi</span>
                        <span className="text-white text-base">
                            {formatDate(request.createdAt)}
                        </span>
                    </div>

                    {/* Updated */}
                    {request.updatedAt && (
                        <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                            <span className="text-gray-400 text-base">Cập nhật lần cuối</span>
                            <span className="text-white text-base">
                                {formatDate(request.updatedAt)}
                            </span>
                        </div>
                    )}

                    {/* Request ID */}
                    <div className="px-5 lg:px-6 py-4 flex justify-between items-center">
                        <span className="text-gray-400 text-base">Mã yêu cầu</span>
                        <span className="text-gray-300 text-sm font-mono">
                            ...{shortId}
                        </span>
                    </div>
                </div>

                {/* Combo Supply đã chọn */}
                {request.comboSupplyId && (
                    <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl p-5 lg:p-6 space-y-3">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            📦 Gói nhu yếu phẩm đã chọn
                        </p>
                        {typeof request.comboSupplyId === "object" && request.comboSupplyId !== null ? (
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-sm">
                                        {request.comboSupplyId.name || "Combo"}
                                    </span>
                                    {request.comboSupplyId.incidentType && (
                                        <span className="text-xs text-gray-400 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                            {request.comboSupplyId.incidentType}
                                        </span>
                                    )}
                                </div>
                                {Array.isArray(request.comboSupplyId.supplies) && request.comboSupplyId.supplies.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {request.comboSupplyId.supplies.map((item: any, idx: number) => {
                                            const supplyName = typeof item.supplyId === "object" ? item.supplyId?.name : item.supplyId;
                                            const supplyUnit = typeof item.supplyId === "object" ? item.supplyId?.unit : "";
                                            return (
                                                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                                    <span className="text-lg">🧴</span>
                                                    <div>
                                                        <p className="text-white text-sm font-semibold">{supplyName || `Vật tư ${idx + 1}`}</p>
                                                        <p className="text-gray-400 text-xs">Số lượng: {item.quantity} {supplyUnit}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-300 text-sm font-mono">{String(request.comboSupplyId)}</p>
                        )}
                    </div>
                )}

                {/* Description */}
                {request.description && (
                    <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl p-5 lg:p-6 space-y-3">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                            Mô tả tình huống
                        </p>
                        <p className="text-gray-100 text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                            {request.description}
                        </p>
                    </div>
                )}

                {/* Location + Map */}
                {(locationText || (mapLat !== null && mapLon !== null)) && (
                    <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl p-5 lg:p-6 space-y-4">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            <FiMapPin /> Vị trí
                        </p>
                        {locationText && (
                            <div className="space-y-2">
                                <p className="text-gray-100 text-base lg:text-lg leading-relaxed">
                                    {locationText.split(',').map((part, idx) => (
                                        <span key={idx} className="block">
                                            {part.trim()}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {mapLat !== null && mapLon !== null && (
                            <>
                                <p className="text-gray-400 text-xs font-mono">
                                    Tọa độ: {mapLat.toFixed(6)}, {mapLon.toFixed(6)}
                                </p>
                                <div className="h-64 lg:h-[420px] rounded-xl overflow-hidden border border-white/20">
                                    <OpenMap
                                        latitude={mapLat}
                                        longitude={mapLon}
                                        address={locationText || "Vị trí yêu cầu"}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="bg-[#0f2f44]/70 border border-white/20 rounded-xl p-5 lg:p-6 space-y-4">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            <FiImage /> Hình ảnh hiện trường ({images.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                            {images.map((url: string, i: number) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openLightbox(i)}
                                    className="relative aspect-square rounded-lg overflow-hidden border border-white/20 hover:border-[#FF7700]/60 transition-all group focus:outline-none focus:ring-2 focus:ring-[#FF7700]"
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
                                        <FiSearch className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                                    </div>
                                    {/* index badge */}
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                                        {i + 1}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {actionSuccess ? (
                    <div className="flex items-center gap-3 p-5 lg:p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold text-base lg:text-lg">
                        <FiCheckCircle className="text-2xl" />
                        <span>{actionSuccess}</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {["VERIFIED", "Accepted", "ACCEPTED", "IN_PROGRESS", "In Progress", "PARTIALLY_FULFILLED", "FULFILLED", "CLOSED", "COMPLETED", "Completed"].includes(request.status) && (
                            <div className="flex items-start gap-3 p-5 lg:p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-base">

                                <span>
                                    Bạn chỉ có thể hủy yêu cầu khi đang ở trạng thái chờ tiếp nhận.
                                </span>
                            </div>
                        )}

                        {canCancelRequest && (
                            <button
                                onClick={handleCancelRequest}
                                disabled={actionLoading !== null}
                                className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 hover:border-red-500/60 rounded-xl text-red-300 font-bold text-base lg:text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === "cancel" ? (
                                    <><div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Đang hủy...</>
                                ) : (
                                    <><FiSlash /> Hủy yêu cầu</>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Back to history button */}
                <Link
                    href="/history"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-bold text-base transition-all"
                >
                    <FiArrowLeft /> Quay lại lịch sử yêu cầu
                </Link>
            </main>

            {/* Cancel confirmation modal */}
            {isCancelConfirmOpen && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-400/30 bg-[#17384f] p-5 shadow-2xl">
                        <p className="text-red-300 font-extrabold text-lg">Xác nhận hủy yêu cầu</p>
                        <p className="text-white/85 text-sm leading-relaxed mt-2">
                            Bạn có chắc muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="mt-5 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCancelConfirmOpen(false)}
                                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                onClick={executeCancelRequest}
                                disabled={actionLoading === "cancel"}
                                className="px-4 py-2 rounded-lg border border-red-400/45 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors disabled:opacity-60"
                            >
                                {actionLoading === "cancel" ? "Đang hủy..." : "Xác nhận hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notice modal */}
            {noticeModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#FF7700]/35 bg-[#17384f] p-5 shadow-2xl">
                        <p className="text-[#FFD1A0] font-extrabold text-lg">{noticeModal.title}</p>
                        <p className="text-white/85 text-sm leading-relaxed mt-2">{noticeModal.description}</p>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setNoticeModal(null)}
                                className="px-4 py-2 rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 text-[#FFD1A0] hover:bg-[#FF7700]/25 transition-colors"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <span className="text-white/70 text-base font-medium inline-flex items-center gap-2">
                            <FiImage /> {lightboxIndex + 1} / {images.length}
                        </span>
                        <button
                            onClick={closeLightbox}
                            className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white font-bold text-xl transition-colors"
                            aria-label="Đóng"
                        >
                            <FiX />
                        </button>
                    </div>

                    {/* ── Image area ── */}
                    <div
                        className="flex-1 flex items-center justify-center px-4 lg:px-8 relative min-h-0"
                        onClick={closeLightbox}
                    >
                        {/* Prev */}
                        {lightboxIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-3 lg:left-5 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-colors shadow-lg"
                                aria-label="Ảnh trước"
                            >
                                <FiChevronLeft />
                            </button>
                        )}

                        {/* Loading spinner */}
                        {!imgLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
                            style={{ maxHeight: "calc(100vh - 220px)" }}
                            draggable={false}
                        />

                        {/* Next */}
                        {lightboxIndex < images.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(images.length); }}
                                className="absolute right-3 lg:right-5 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-colors shadow-lg"
                                aria-label="Ảnh tiếp"
                            >
                                <FiChevronRight />
                            </button>
                        )}
                    </div>

                    {/* ── Thumbnail strip ── */}
                    {images.length > 1 && (
                        <div className="flex-shrink-0 px-6 py-4 flex gap-3 justify-center overflow-x-auto">
                            {images.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => openLightbox(i)}
                                    className={`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex
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
                    <p className="text-center text-white/30 text-sm pb-4 flex-shrink-0 inline-flex items-center justify-center gap-2">
                        Bấm ngoài ảnh để đóng · Phím
                        <FiChevronLeft className="inline" />
                        <FiChevronRight className="inline" />
                        để chuyển · Vuốt để lướt
                    </p>
                </div>
            )}
        </div>
    );
}
