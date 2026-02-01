"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

interface RequestDetailPageProps {
    requestId: string;
}

export default function RequestDetailPage({ requestId }: RequestDetailPageProps) {
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Mock data
    const request = {
        id: requestId,
        type: "Rescue",
        location: "123 Nguyễn Trãi, Quận 5, TP.HCM",
        latitude: 10.7626,
        longitude: 106.6822,
        priority: "critical",
        status: "pending",
        reporter: {
            name: "Nguyễn Văn A",
            phone: "0912345678",
        },
        peopleCount: 5,
        description: "Nước lũ dâng cao 1.5m, có người già và trẻ em cần di tản khẩn cấp. Không thể thoát ra ngoài.",
        images: [
            "/placeholder-image1.jpg",
            "/placeholder-image2.jpg",
            "/placeholder-image3.jpg",
        ],
        createdAt: "2026-01-31 10:30",
        timeline: [
            { time: "10:30", event: "Request submitted", icon: "📝" },
            { time: "10:32", event: "Marked as Critical", icon: "🚨" },
            { time: "10:35", event: "Under review", icon: "👁️" },
        ],
    };

    const priorityColors: Record<string, string> = {
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
                    title={`Request #${requestId}`}
                    subtitle="Chi tiết yêu cầu cứu hộ"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Back Button */}
                        <Link
                            href="/coordinator/requests"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold"
                        >
                            ← Back to Requests
                        </Link>

                        {/* Request Header */}
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">Request #{request.id}</h1>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${priorityColors[request.priority]}`}>
                                            {request.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">📍 {request.location}</p>
                                    <p className="text-sm text-gray-400 mt-1">Submitted: {request.createdAt}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all"
                                    >
                                        🚁 Assign Rescue Team
                                    </button>
                                    <button className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-bold transition-all">
                                        📞 Call Reporter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Reporter Info */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>👤</span>
                                        Reporter Information
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-400">Name</p>
                                            <p className="text-white font-bold">{request.reporter.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Phone</p>
                                            <p className="text-white font-bold">{request.reporter.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">People Affected</p>
                                            <p className="text-white font-bold">{request.peopleCount} người</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>📄</span>
                                        Description
                                    </h2>
                                    <p className="text-gray-300 leading-relaxed">{request.description}</p>
                                </div>

                                {/* Photos */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>📷</span>
                                        Photos ({request.images.length})
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {request.images.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                                <span className="text-4xl">🖼️</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Map */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>🗺️</span>
                                        Location on Map
                                    </h2>
                                    <div className="bg-white/5 border border-white/10 rounded-xl h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">🗺️</div>
                                            <p className="text-gray-400">Interactive map will display here</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Lat: {request.latitude}, Lon: {request.longitude}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Status & Priority */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>⚙️</span>
                                        Status & Priority
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
                                            <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                                <option>Pending</option>
                                                <option>Assigned</option>
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Priority</label>
                                            <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                                <option>Critical</option>
                                                <option>High</option>
                                                <option>Medium</option>
                                                <option>Low</option>
                                            </select>
                                        </div>
                                        <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all">
                                            Update
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>⏱️</span>
                                        Activity Timeline
                                    </h2>
                                    <div className="space-y-4">
                                        {request.timeline.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="text-2xl">{item.icon}</div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold">{item.event}</p>
                                                    <p className="text-sm text-gray-400">{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span>⚡</span>
                                        Quick Actions
                                    </h2>
                                    <div className="space-y-2">
                                        <button className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold transition-all">
                                            ✅ Mark as Verified
                                        </button>
                                        <button className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-bold transition-all">
                                            📝 Add Notes
                                        </button>
                                        <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-all">
                                            ❌ Cancel Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <MobileBottomNav />
            </div>

            {/* Assign Team Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-secondary border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Assign Rescue Team</h2>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                {["Team Alpha", "Team Bravo", "Team Charlie"].map((team) => (
                                    <div key={team} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-white font-bold">{team}</h3>
                                                <p className="text-sm text-gray-400">5 members • Available</p>
                                            </div>
                                            <button className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all">
                                                Assign
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
