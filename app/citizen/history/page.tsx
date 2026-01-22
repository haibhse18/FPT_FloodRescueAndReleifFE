"use client";

import { useState } from "react";
import Link from "next/link";

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

    // Mock data
    const historyData: RescueHistory[] = [
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
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white/5 border-r border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-white">Cứu hộ Lũ lụt</h1>
                    <p className="text-sm text-gray-400 mt-1">FPT Flood Rescue</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/citizen" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">🏠</span>
                                <span>Trang chủ</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/history" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-semibold">
                                <span className="text-xl">📜</span>
                                <span>Lịch sử</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/notifications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">🔔</span>
                                <span>Thông báo</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">👤</span>
                                <span>Cá nhân</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            U
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">User Account</p>
                            <p className="text-xs text-gray-400">Citizen</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center justify-between p-4">
                        <Link href="/citizen" className="w-10 h-10 flex items-center justify-center text-white">
                            <span className="text-2xl">←</span>
                        </Link>
                        <h2 className="text-lg font-bold text-white">Lịch sử</h2>
                        <div className="w-10 h-10"></div>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Lịch sử yêu cầu</h2>
                        <p className="text-gray-400 text-sm mt-1">Xem lại tất cả các yêu cầu cứu hộ của bạn</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
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
                            {filteredData.length === 0 ? (
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

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden sticky bottom-0 bg-secondary/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
                    <div className="flex justify-around items-center">
                        <Link href="/citizen" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">🏠</span>
                            <span className="text-[10px] font-bold">TRANG CHỦ</span>
                        </Link>
                        <Link href="/citizen/history" className="flex flex-col items-center gap-1 text-primary">
                            <span className="text-2xl">📜</span>
                            <span className="text-[10px] font-bold">LỊCH SỬ</span>
                        </Link>
                        <Link href="/citizen/notifications" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">🔔</span>
                            <span className="text-[10px] font-bold">THÔNG BÁO</span>
                        </Link>
                        <Link href="/citizen/profile" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">👤</span>
                            <span className="text-[10px] font-bold">CÁ NHÂN</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
