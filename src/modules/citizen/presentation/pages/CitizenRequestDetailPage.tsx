"use client";

import { useState, useEffect } from "react";
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

const STATUS_META: Record<
    string,
    { label: string; color: string; icon: string; step: number }
> = {
    Submitted: {
        label: "Chờ xử lý",
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: "⏳",
        step: 0,
    },
    Accepted: {
        label: "Đã chấp nhận",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: "✅",
        step: 1,
    },
    "In Progress": {
        label: "Đang xử lý",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        icon: "🚀",
        step: 2,
    },
    Completed: {
        label: "Hoàn thành",
        color: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: "🎉",
        step: 3,
    },
    Rejected: {
        label: "Bị từ chối",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: "❌",
        step: -1,
    },
    Cancelled: {
        label: "Đã hủy",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: "🚫",
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

const TYPE_LABELS: Record<string, string> = {
    flood: "🌊 Lũ lụt",
    trapped: "🆘 Mắc kẹt",
    injury: "🩹 Chấn thương",
    landslide: "⛰️ Sạt lở",
    other: "⚠️ Khác",
    // API category values
    Rescue: "🚁 Cứu hộ",
    rescue: "🚁 Cứu hộ",
    Relief: "📦 Cứu trợ",
    relief: "📦 Cứu trợ",
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
    const shortId = (request.id || "").slice(-8).toUpperCase();
    const images: string[] = request.imageUrls || request.images || [];

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
                {(request.location ||
                    (request.latitude && request.longitude)) && (
                        <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                📍 Vị trí
                            </p>
                            {request.location && (
                                <p className="text-gray-100 text-sm">{request.location}</p>
                            )}
                            {request.latitude && request.longitude && (
                                <div className="h-48 rounded-xl overflow-hidden border border-white/10">
                                    <OpenMap
                                        latitude={request.latitude}
                                        longitude={request.longitude}
                                        address={request.location || "Vị trí yêu cầu"}
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
                                    onClick={() => setLightboxIndex(i)}
                                    className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#FF7700]/50 transition-all group focus:outline-none focus:ring-2 focus:ring-[#FF7700]"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Ảnh hiện trường ${i + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </button>
                            ))}
                        </div>
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

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    >
                        ✕
                    </button>
                    {lightboxIndex > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(lightboxIndex - 1);
                            }}
                            className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        >
                            ←
                        </button>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={images[lightboxIndex]}
                        alt={`Ảnh ${lightboxIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {lightboxIndex < images.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(lightboxIndex + 1);
                            }}
                            className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        >
                            →
                        </button>
                    )}
                    <p className="absolute bottom-4 text-gray-400 text-sm">
                        {lightboxIndex + 1} / {images.length}
                    </p>
                </div>
            )}
        </div>
    );
}
