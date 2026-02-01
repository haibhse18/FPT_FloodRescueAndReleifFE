"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

interface DashboardStats {
    pendingRequests: number;
    activeMissions: number;
    completedToday: number;
    availableTeams: number;
}

interface RecentRequest {
    id: string;
    location: string;
    priority: "critical" | "high" | "medium" | "low";
    status: string;
    createdAt: string;
}

export default function CoordinatorDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        pendingRequests: 12,
        activeMissions: 8,
        completedToday: 15,
        availableTeams: 5,
    });

    const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([
        {
            id: "REQ123",
            location: "Quận 5, TP.HCM",
            priority: "critical",
            status: "Pending",
            createdAt: "10 phút trước",
        },
        {
            id: "REQ124",
            location: "Quận 7, TP.HCM",
            priority: "high",
            status: "Assigned",
            createdAt: "25 phút trước",
        },
        {
            id: "REQ125",
            location: "Quận 1, TP.HCM",
            priority: "medium",
            status: "In Progress",
            createdAt: "1 giờ trước",
        },
    ]);

    const priorityColor = {
        critical: "bg-red-500/20 text-red-400 border-red-500/30",
        high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        low: "bg-green-500/20 text-green-400 border-green-500/30",
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader
                    title="Dashboard"
                    subtitle="Tổng quan điều phối cứu hộ"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-4xl">📝</div>
                                    <div className="text-3xl font-bold text-blue-400">{stats.pendingRequests}</div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase">Pending Requests</h3>
                                <p className="text-xs text-gray-500 mt-1">Yêu cầu chờ xử lý</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-4xl">🚁</div>
                                    <div className="text-3xl font-bold text-green-400">{stats.activeMissions}</div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase">Active Missions</h3>
                                <p className="text-xs text-gray-500 mt-1">Nhiệm vụ đang thực hiện</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-4xl">✅</div>
                                    <div className="text-3xl font-bold text-purple-400">{stats.completedToday}</div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase">Completed Today</h3>
                                <p className="text-xs text-gray-500 mt-1">Hoàn thành hôm nay</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-4xl">👷</div>
                                    <div className="text-3xl font-bold text-orange-400">{stats.availableTeams}</div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase">Available Teams</h3>
                                <p className="text-xs text-gray-500 mt-1">Đội sẵn sàng</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⚡</span>
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <Link
                                    href="/coordinator/requests"
                                    className="flex flex-col items-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-all"
                                >
                                    <span className="text-3xl">📋</span>
                                    <span className="text-sm font-bold text-white">All Requests</span>
                                </Link>
                                <Link
                                    href="/coordinator/teams"
                                    className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all"
                                >
                                    <span className="text-3xl">👥</span>
                                    <span className="text-sm font-bold text-white">Teams</span>
                                </Link>
                                <Link
                                    href="/coordinator/map"
                                    className="flex flex-col items-center gap-2 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all"
                                >
                                    <span className="text-3xl">🗺️</span>
                                    <span className="text-sm font-bold text-white">Map View</span>
                                </Link>
                                <Link
                                    href="/coordinator/reports"
                                    className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all"
                                >
                                    <span className="text-3xl">📊</span>
                                    <span className="text-sm font-bold text-white">Reports</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Requests */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🆕</span>
                                    Recent Requests
                                </h2>
                                <Link
                                    href="/coordinator/requests"
                                    className="text-sm font-bold text-primary hover:text-primary/80"
                                >
                                    View All →
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentRequests.map((request) => (
                                    <Link
                                        key={request.id}
                                        href={`/coordinator/requests/${request.id}`}
                                        className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm text-gray-400">#{request.id}</span>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${priorityColor[request.priority]}`}>
                                                        {request.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-white font-bold mb-1">{request.location}</p>
                                                <p className="text-sm text-gray-400">{request.createdAt}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>🗺️</span>
                                Active Requests Map
                            </h2>
                            <div className="bg-white/5 border border-white/10 rounded-xl h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🗺️</div>
                                    <p className="text-gray-400">Map preview sẽ hiển thị ở đây</p>
                                    <Link
                                        href="/coordinator/map"
                                        className="inline-block mt-4 px-6 py-2 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all"
                                    >
                                        View Full Map
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
