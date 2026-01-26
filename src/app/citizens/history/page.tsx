"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/api";
import MobileHeader from "@/app/components/layout/MobileHeader";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";
import DesktopHeader from "@/app/components/layout/DesktopHeader";
import DesktopSidebar from "@/app/components/layout/DesktopSidebar";

interface RescueHistory {
    id: string;
    type: string;
    icon: string;
    status: "completed" | "pending" | "cancelled";
    date: string;
    time: string;
    location: string;
    description: string;
    numberOfPeople: number;
    responder?: string;
}

export default function HistoryPage() {
    const [filter, setFilter] = useState<"all" | "completed" | "pending" | "cancelled">("all");
    const [historyData, setHistoryData] = useState<RescueHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch history from API
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const data = await API.citizen.getHistory() as RescueHistory[];
                setHistoryData(data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
                // Fallback to mock data on error
                setHistoryData(mockHistoryData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Mock data fallback
    const mockHistoryData: RescueHistory[] = [
        {
            id: "REQ001",
            type: "Ngập lụt",
            icon: "🌊",
            status: "completed",
            date: "22/01/2026",
            time: "14:30",
            location: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
            description: "Nước ngập cao 1.5m, cần di chuyển khẩn cấp",
            numberOfPeople: 3,
            responder: "Đội cứu hộ A"
        },
        {
            id: "REQ002",
            type: "Bị kẹt",
            icon: "🏚️",
            status: "completed",
            date: "21/01/2026",
            time: "10:15",
            location: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
            description: "Bị mắc kẹt tầng 2, không thể xuống",
            numberOfPeople: 2,
            responder: "Đội cứu hộ B"
        },
        {
            id: "REQ003",
            type: "Cứu trợ thực phẩm",
            icon: "🍚",
            status: "pending",
            date: "22/01/2026",
            time: "16:00",
            location: "789 Trần Hưng Đạo, Quận 1, TP.HCM",
            description: "Cần thực phẩm và nước uống khẩn cấp",
            numberOfPeople: 5
        },
        {
            id: "REQ004",
            type: "Bị thương",
            icon: "🤕",
            status: "cancelled",
            date: "20/01/2026",
            time: "08:45",
            location: "321 Võ Văn Tần, Quận 3, TP.HCM",
            description: "Có người bị thương nhẹ",
            numberOfPeople: 1
        }
    ];

    const filteredData = filter === "all"
        ? historyData
        : historyData.filter(item => item.status === filter);

    const statusConfig = {
        completed: {
            label: "Hoàn thành",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/30"
        },
        pending: {
            label: "Đang xử lý",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/30"
        },
        cancelled: {
            label: "Đã hủy",
            color: "text-gray-500",
            bg: "bg-gray-500/10",
            border: "border-gray-500/30"
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar userName="User Account" userRole="Citizen" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader onLocationClick={() => { }} />

                <DesktopHeader
                    title="Lịch sử yêu cầu"
                    subtitle="Xem lại tất cả các yêu cầu cứu hộ của bạn"
                />

                <main className="flex-1 overflow-y-auto pt-[73px] lg:pt-[89px] pb-24 lg:pb-0">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="text-3xl mb-2">✅</div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Hoàn thành</p>
                                <p className="text-2xl font-bold text-green-500 mt-1">
                                    {historyData.filter(h => h.status === "completed").length}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <div className="text-3xl mb-2">⏳</div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Đang xử lý</p>
                                <p className="text-2xl font-bold text-yellow-500 mt-1">
                                    {historyData.filter(h => h.status === "pending").length}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
                                <div className="text-3xl mb-2">❌</div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Đã hủy</p>
                                <p className="text-2xl font-bold text-gray-500 mt-1">
                                    {historyData.filter(h => h.status === "cancelled").length}
                                </p>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {[
                                { value: "all", label: "Tất cả", count: historyData.length },
                                { value: "completed", label: "Hoàn thành", count: historyData.filter(h => h.status === "completed").length },
                                { value: "pending", label: "Đang xử lý", count: historyData.filter(h => h.status === "pending").length },
                                { value: "cancelled", label: "Đã hủy", count: historyData.filter(h => h.status === "cancelled").length }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value as typeof filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${filter === tab.value
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>

                        {/* History List */}
                        <div className="space-y-4">
                            {isLoading ? (
                                // Loading skeleton
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-white/10 rounded w-1/3"></div>
                                                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                                                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-gray-400 text-lg">Chưa có lịch sử nào</p>
                                </div>
                            ) : (
                                filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl">
                                                {item.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white mb-1">
                                                            {item.type}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <span>🆔 {item.id}</span>
                                                            <span>•</span>
                                                            <span>📅 {item.date}</span>
                                                            <span>•</span>
                                                            <span>🕐 {item.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusConfig[item.status].bg} ${statusConfig[item.status].color} border ${statusConfig[item.status].border}`}>
                                                        {statusConfig[item.status].label}
                                                    </div>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-start gap-2 text-sm text-gray-300 mb-2">
                                                    <span className="text-base">📍</span>
                                                    <span className="flex-1">{item.location}</span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-gray-400 mb-3">
                                                    {item.description}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <span>👥</span>
                                                            <span>{item.numberOfPeople} người</span>
                                                        </div>
                                                        {item.responder && (
                                                            <div className="flex items-center gap-1 text-gray-400">
                                                                <span>🚑</span>
                                                                <span>{item.responder}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button className="text-sm text-primary font-bold hover:underline">
                                                        Chi tiết →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <MobileBottomNav
                    items={[
                        { icon: "🏠", label: "TRANG CHỦ", href: "/citizens" },
                        { icon: "📜", label: "LỊCH SỬ", href: "/citizens/history" },
                        { icon: "🔔", label: "THÔNG BÁO", href: "/citizens/notifications" },
                        { icon: "👤", label: "CÁ NHÂN", href: "/citizens/profile" },
                    ]}
                    currentPath="/citizens/history"
                />
            </div>
        </div>
    );
}
