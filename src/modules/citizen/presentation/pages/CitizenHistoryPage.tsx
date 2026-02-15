"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

interface Request {
    id: string;
    type: string;
    status: string;
    location: string;
    createdAt: string;
    completedAt?: string;
    statusText: string;
    statusColor: string;
    priority: string;
    peopleCount: number;
    description?: string;
}

export default function CitizenHistoryPage() {
    const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await requestRepository.getMyRequests();
            
            // Map API response to UI format
            const mappedRequests: Request[] = data.map((req: any) => {
                const statusMap: Record<string, { text: string; color: string; filter: string }> = {
                    'Submitted': { text: 'Chờ xử lý', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', filter: 'pending' },
                    'Accepted': { text: 'Đã chấp nhận', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', filter: 'in_progress' },
                    'Rejected': { text: 'Bị từ chối', color: 'bg-red-500/20 text-red-400 border-red-500/30', filter: 'completed' },
                    'In Progress': { text: 'Đang xử lý', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', filter: 'in_progress' },
                    'Completed': { text: 'Hoàn thành', color: 'bg-green-500/20 text-green-400 border-green-500/30', filter: 'completed' },
                    'Cancelled': { text: 'Đã hủy', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', filter: 'completed' }
                };

                const status = statusMap[req.status] || statusMap['Submitted'];
                
                return {
                    id: req.requestId || req.id,
                    type: req.type === 'rescue' ? 'Cứu hộ' : req.type === 'supply' ? 'Cứu trợ' : 'Yêu cầu',
                    status: status.filter,
                    location: req.location || `${req.latitude?.toFixed(4)}, ${req.longitude?.toFixed(4)}`,
                    createdAt: new Date(req.createdAt).toLocaleString('vi-VN'),
                    completedAt: req.completedAt ? new Date(req.completedAt).toLocaleString('vi-VN') : undefined,
                    statusText: status.text,
                    statusColor: status.color,
                    priority: req.priority?.toLowerCase() || req.urgencyLevel?.toLowerCase() || 'medium',
                    peopleCount: req.peopleCount || req.numberOfPeople || 1,
                    description: req.description
                };
            });

            setRequests(mappedRequests);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Không thể tải lịch sử yêu cầu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Fixed Header Banner */}
                <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-white text-xl lg:text-2xl font-extrabold mb-0.5">Lịch sử yêu cầu</h1>
                                <p className="text-white/90 text-xs lg:text-sm">Theo dõi trạng thái các yêu cầu của bạn</p>
                            </div>
                            <button
                                onClick={fetchRequests}
                                disabled={isLoading}
                                className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Làm mới"
                            >
                                <span className={`text-xl ${isLoading ? 'animate-spin inline-block' : ''}`}>🔄</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="pb-24 lg:pb-0 overflow-auto">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                    <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-4 lg:p-5 text-center hover:scale-105 transition-transform`}
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
                                <span className="text-gray-400 text-sm font-bold mr-2">🔍 Lọc:</span>
                                {[
                                    { value: "all", label: "Tất cả", icon: "📋" },
                                    { value: "pending", label: "Chờ xử lý", icon: "⏱️" },
                                    { value: "in_progress", label: "Đang xử lý", icon: "⏳" },
                                    { value: "completed", label: "Hoàn thành", icon: "✅" }
                                ].map((btn) => (
                                    <button
                                        key={btn.value}
                                        onClick={() => setFilter(btn.value as typeof filter)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === btn.value
                                            ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/20"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        <span className="mr-1">{btn.icon}</span>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Requests List */}
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Đang tải...
                                    </h3>
                                    <p className="text-gray-400">
                                        Vui lòng đợi trong giây lát
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-bold text-red-400 mb-2">
                                        Đã xảy ra lỗi
                                    </h3>
                                    <p className="text-gray-400 mb-4">{error}</p>
                                    <button
                                        onClick={fetchRequests}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
                                    >
                                        <span>🔄</span>
                                        <span>Thử lại</span>
                                    </button>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                    <div className="text-6xl mb-4">
                                        {requests.length === 0 ? '📭' : '🔭'}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {requests.length === 0 
                                            ? 'Chưa có yêu cầu nào'
                                            : 'Không tìm thấy yêu cầu phù hợp'
                                        }
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        {requests.length === 0
                                            ? 'Bạn chưa gửi yêu cầu cứu hộ/cứu trợ nào'
                                            : 'Thử thay đổi bộ lọc để xem các yêu cầu khác'
                                        }
                                    </p>
                                    {requests.length === 0 && (
                                        <Link
                                            href="/citizen/request"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
                                        >
                                            <span>➕</span>
                                            <span>Tạo yêu cầu mới</span>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                                            : request.priority === "medium"
                                                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                        }`}>
                                                        {request.priority === "critical" ? "🚨 KHẨN CẤP" :
                                                            request.priority === "high" ? "⚠️ CAO" :
                                                                request.priority === "medium" ? "📌 TRUNG BÌNH" : "ℹ️ THẤP"}
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
                                                href={`/citizen/requests/${request.id}`}
                                                className="flex-1 px-4 py-2 bg-[#FF7700]/20 hover:bg-[#FF7700]/30 border border-[#FF7700]/30 rounded-xl text-[#FF7700] hover:text-[#FF8800] text-sm font-bold text-center transition-all"
                                            >
                                                👁️ Xem chi tiết
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
