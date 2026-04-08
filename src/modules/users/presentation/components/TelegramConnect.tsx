"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// NEXT_PUBLIC_API_URL thường kết thúc bằng /api (vd: http://localhost:8080/api)
// Ta cần base URL không có /api để tự thêm path đầy đủ
const RAW_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const API_BASE = RAW_API.replace(/\/api\/?$/, "");

interface TelegramStatus {
    linked: boolean;
}

interface LinkTokenResponse {
    token: string;
    botUsername: string;
    command: string;
    expiresAt: string;
    expiresInMinutes: number;
}

export default function TelegramConnect() {
    const [status, setStatus] = useState<TelegramStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [linkData, setLinkData] = useState<LinkTokenResponse | null>(null);
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeader = () => {
        const token =
            document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken="))
                ?.split("=")[1] ??
            localStorage.getItem("accessToken") ??
            "";
        return { Authorization: `Bearer ${token}` };
    };

    const fetchStatus = useCallback(async () => {
        setIsLoadingStatus(true);
        try {
            const res = await axios.get<TelegramStatus>(`${API_BASE}/api/telegram/status`, {
                headers: getAuthHeader(),
                withCredentials: true,
            });
            setStatus(res.data);
        } catch {
            setStatus({ linked: false });
        } finally {
            setIsLoadingStatus(false);
        }
    }, []);

    useEffect(() => {
        void fetchStatus();
    }, [fetchStatus]);

    // Countdown timer
    useEffect(() => {
        if (!linkData) return;
        const expiry = new Date(linkData.expiresAt).getTime();
        const tick = setInterval(() => {
            const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
            setCountdown(remaining);
            if (remaining === 0) {
                clearInterval(tick);
                setLinkData(null);
            }
        }, 1000);
        return () => clearInterval(tick);
    }, [linkData]);

    const handleGenerateToken = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await axios.post<LinkTokenResponse>(
                `${API_BASE}/api/telegram/link-token`,
                {},
                { headers: getAuthHeader(), withCredentials: true }
            );
            setLinkData(res.data);
            setCountdown(res.data.expiresInMinutes * 60);
        } catch {
            setError("Không thể tạo token. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUnlink = async () => {
        setIsUnlinking(true);
        setError(null);
        try {
            await axios.post(
                `${API_BASE}/api/telegram/unlink`,
                {},
                { headers: getAuthHeader(), withCredentials: true }
            );
            setStatus({ linked: false });
            setLinkData(null);
        } catch {
            setError("Không thể huỷ liên kết. Vui lòng thử lại.");
        } finally {
            setIsUnlinking(false);
        }
    };

    const handleCopy = () => {
        if (!linkData) return;
        void navigator.clipboard.writeText(linkData.command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCountdown = (secs: number) => {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const isExpiringSoon = countdown > 0 && countdown <= 60;

    return (
        <div className="py-8 border-b border-white/20">
            {/* Header */}
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl bg-[#0f2f44]/70 border border-white/20 text-[#54a9eb] p-2 rounded-xl">
                    <TelegramIcon size={24} />
                </span>
                Kết nối Telegram
            </h3>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-400 text-sm font-medium">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-400/70 hover:text-red-400 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Loading state */}
            {isLoadingStatus ? (
                <div className="flex items-center gap-3 p-5 rounded-xl bg-[#0f2f44]/70 border border-white/20">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
                    </div>
                </div>
            ) : status?.linked ? (
                /* ── LINKED STATE ── */
                <div className="p-5 rounded-xl bg-[#0f2f44]/70 border border-[#54a9eb]/30 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#54a9eb]/20 border border-[#54a9eb]/40 flex items-center justify-center flex-shrink-0">
                            <TelegramIcon size={24} className="text-[#54a9eb]" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-white font-bold">Đã kết nối Telegram</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
                                    ✓ Active
                                </span>
                            </div>
                            <p className="text-white/60 text-sm">
                                Bạn sẽ nhận thông báo qua Telegram khi có sự kiện quan trọng.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => void handleUnlink()}
                        disabled={isUnlinking}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUnlinking ? "Đang huỷ..." : "Huỷ kết nối Telegram"}
                    </button>
                </div>
            ) : linkData ? (
                /* ── LINKING INSTRUCTIONS ── */
                <div className="p-5 rounded-xl bg-[#0f2f44]/70 border border-[#54a9eb]/30 space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 mt-0.5">📱</span>
                        <div>
                            <p className="text-white font-bold mb-1">Cách liên kết</p>
                            <p className="text-white/65 text-sm leading-relaxed">
                                Mở Telegram, tìm{" "}
                                {linkData.botUsername ? (
                                    <a
                                        href={`https://t.me/${linkData.botUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#54a9eb] font-semibold hover:underline"
                                    >
                                        @{linkData.botUsername}
                                    </a>
                                ) : (
                                    <span className="text-[#54a9eb] font-semibold">Flood Rescue Bot</span>
                                )}{" "}
                                và gửi lệnh bên dưới:
                            </p>
                        </div>
                    </div>

                    {/* Command box */}
                    <div className="relative group">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#071d2e] border border-white/15 font-mono text-sm">
                            <span className="text-[#54a9eb] font-bold flex-1 select-all">
                                {linkData.command}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#54a9eb]/20 hover:bg-[#54a9eb]/35 border border-[#54a9eb]/30 text-[#54a9eb] text-xs font-bold transition-all duration-200"
                            >
                                {copied ? "✓ Đã copy" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-colors ${
                            isExpiringSoon
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : "bg-white/5 border-white/15 text-white/60"
                        }`}
                    >
                        <span>⏱ Token hết hạn sau</span>
                        <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                    </div>

                    <div className="flex gap-3">
                        {linkData.botUsername && (
                            <a
                                href={`https://t.me/${linkData.botUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#54a9eb]/20 hover:bg-[#54a9eb]/35 border border-[#54a9eb]/35 text-[#54a9eb] font-bold text-sm text-center transition-all duration-200"
                            >
                                Mở Telegram Bot ↗
                            </a>
                        )}
                        <button
                            onClick={() => setLinkData(null)}
                            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 font-semibold text-sm transition-all duration-200"
                        >
                            Huỷ
                        </button>
                    </div>

                    {/* Poll for success */}
                    <button
                        onClick={() => void fetchStatus()}
                        className="w-full py-2 text-center text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
                    >
                        Đã gửi lệnh? Nhấn để kiểm tra lại trạng thái
                    </button>
                </div>
            ) : (
                /* ── NOT LINKED STATE ── */
                <div className="p-5 rounded-xl bg-[#0f2f44]/70 border border-white/20 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                            <TelegramIcon size={24} className="text-white/40" />
                        </div>
                        <div>
                            <p className="text-white font-bold mb-0.5">Chưa kết nối Telegram</p>
                            <p className="text-white/55 text-sm">
                                Kết nối để nhận thông báo cứu hộ trực tiếp trên Telegram.
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-1.5 text-sm text-white/55">
                        {[
                            "🆘 Yêu cầu cứu hộ mới",
                            "📌 Phân công nhiệm vụ",
                            "🏁 Nhiệm vụ hoàn thành / thất bại",
                            "🛑 Nhiệm vụ bị huỷ khẩn cấp",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => void handleGenerateToken()}
                        disabled={isGenerating}
                        className="w-full py-3 px-4 rounded-xl bg-[#54a9eb]/20 hover:bg-[#54a9eb]/35 border border-[#54a9eb]/35 text-[#54a9eb] font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="w-4 h-4 border-2 border-[#54a9eb]/40 border-t-[#54a9eb] rounded-full animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <TelegramIcon size={18} />
                                Kết nối Telegram
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// Inline Telegram SVG icon để không cần thêm dependency
function TelegramIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.6l-2.95-.924c-.64-.203-.658-.64.136-.953l11.57-4.461c.537-.194 1.006.131.968.959z" />
        </svg>
    );
}
