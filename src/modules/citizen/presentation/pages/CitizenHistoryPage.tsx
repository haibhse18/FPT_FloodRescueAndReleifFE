"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

export default function CitizenHistoryPage() {
    const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
    const [requests, setRequests] = useState([
        {
            id: "REQ001",
            type: "Cứu hộ",
            status: "completed",
            location: "123 Nguyễn Trãi, Q5",
            createdAt: "2026-01-30 10:30",
            completedAt: "2026-01-30 12:45",
            statusText: "Hoàn thành",
            statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
            priority: "high",
            peopleCount: 5
        },
        {
            id: "REQ002",
            type: "Cứu trợ",
            status: "in_progress",
            location: "456 Lê Văn Sỹ, Q3",
            createdAt: "2026-01-31 09:15",
            statusText: "Đang xử lý",
            statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            priority: "medium",
            peopleCount: 3
        },
        {
            id: "REQ003",
            type: "Cứu hộ",
            status: "pending",
            location: "789 Võ Văn Tần, Q1",
            createdAt: "2026-02-01 14:20",
            statusText: "Chờ xử lý",
            statusColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            priority: "critical",
            peopleCount: 2
        },
        {
            id: "REQ004",
            type: "Cứu trợ",
            status: "completed",
            location: "321 Điện Biên Phủ, Q10",
            createdAt: "2026-01-29 16:00",
            completedAt: "2026-01-29 18:30",
            statusText: "Hoàn thành",
            statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
            priority: "low",
            peopleCount: 1
        }
    ]);

    const filteredRequests = requests.filter(req =>
        filter === "all" || req.status === filter
    );

    const stats = [
        {
            label: "Tổng cộng",
            value: requests.length.toString(),
            icon: "📊",
            color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30"
        },
        {
            label: "Hoàn thành",
            value: requests.filter(r => r.status === "completed").length.toString(),
            icon: "✅",
            color: "from-green-500/20 to-emerald-500/10 border-green-500/30"
        },
        {
            label: "Đang xử lý",
            value: requests.filter(r => r.status === "in_progress").length.toString(),
            icon: "⏳",
            color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/30"
        },
        {
            label: "Chờ xử lý",
            value: requests.filter(r => r.status === "pending").length.toString(),
            icon: "⏱️",
            color: "from-gray-500/20 to-slate-500/10 border-gray-500/30"
        }
    ];

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader
                    title="Lịch sử yêu cầu"
                    subtitle="Xem lại các yêu cầu cứu hộ và cứu trợ của bạn"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-4 lg:p-5 text-center`}
                                >
                                    <div className="text-3xl lg:text-4xl mb-2">{stat.icon}</div>
                                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs lg:text-sm text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-400 text-sm font-bold mr-2">Lọc:</span>
                                {[
                                    { value: "all", label: "Tất cả" },
                                    { value: "pending", label: "Chờ xử lý" },
                                    { value: "in_progress", label: "Đang xử lý" },
                                    { value: "completed", label: "Hoàn thành" }
                                ].map((btn) => (
                                    <button
                                        key={btn.value}
                                        onClick={() => setFilter(btn.value as typeof filter)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === btn.value
                                                ? "bg-primary text-white"
                                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Requests List */}
                        <div className="space-y-3">
                            {filteredRequests.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                    <div className="text-6xl mb-4">📋</div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Không có yêu cầu nào
                                    </h3>
                                    <p className="text-gray-400">
                                        Thử thay đổi bộ lọc hoặc tạo yêu cầu mới
                                    </p>
                                </div>
                            ) : (
                                filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-mono text-sm text-gray-400">
                                                        #{request.id}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${request.statusColor}`}>
                                                        {request.statusText}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${request.priority === "critical"
                                                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                            : request.priority === "high"
                                                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                        }`}>
                                                        {request.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-2">
                                                    {request.type}
                                                </h3>
                                                <div className="space-y-1 text-sm text-gray-400">
                                                    <p className="flex items-center gap-2">
                                                        <span>📍</span>
                                                        <span>{request.location}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span>👥</span>
                                                        <span>{request.peopleCount} người</span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span>🕐</span>
                                                        <span>Tạo lúc: {request.createdAt}</span>
                                                    </p>
                                                    {request.completedAt && (
                                                        <p className="flex items-center gap-2 text-green-400">
                                                            <span>✅</span>
                                                            <span>Hoàn thành: {request.completedAt}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Link
                                                href={`/citizen/history/${request.id}`}
                                                className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary text-sm font-bold text-center transition-all"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <MobileBottomNav currentPath="/citizen/history" />
            </div>
        </div>
    );
}
