"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

interface Request {
    id: string;
    type: string;
    location: string;
    priority: "critical" | "high" | "medium" | "low";
    status: "pending" | "assigned" | "in_progress" | "completed";
    reporter: string;
    createdAt: string;
    peopleCount: number;
}

export default function CoordinatorRequestsPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [requests, setRequests] = useState<Request[]>([
        {
            id: "REQ123",
            type: "Rescue",
            location: "123 Nguyễn Trãi, Quận 5, TP.HCM",
            priority: "critical",
            status: "pending",
            reporter: "Nguyễn Văn A",
            createdAt: "2026-01-31 10:30",
            peopleCount: 5,
        },
        {
            id: "REQ124",
            type: "Relief",
            location: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
            priority: "high",
            status: "assigned",
            reporter: "Trần Thị B",
            createdAt: "2026-01-31 10:45",
            peopleCount: 3,
        },
        {
            id: "REQ125",
            type: "Rescue",
            location: "789 Võ Văn Tần, Quận 1, TP.HCM",
            priority: "medium",
            status: "in_progress",
            reporter: "Lê Văn C",
            createdAt: "2026-01-31 11:00",
            peopleCount: 2,
        },
    ]);

    const priorityColors = {
        critical: "bg-red-500/20 text-red-400 border-red-500/30",
        high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        low: "bg-green-500/20 text-green-400 border-green-500/30",
    };

    const statusColors = {
        pending: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        completed: "bg-green-500/20 text-green-400 border-green-500/30",
    };

    const filteredRequests = requests.filter((req) => {
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;
        const matchesSearch = req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader
                    title="Rescue Requests"
                    subtitle="Quản lý yêu cầu cứu hộ và phân công nhiệm vụ"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Filters */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Priority</label>
                                    <select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Search</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by location or ID..."
                                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Requests Table */}
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">ID</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Type</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Location</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Priority</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">People</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-gray-400">#{request.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-white font-medium">{request.type}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-white font-medium truncate">{request.location}</p>
                                                        <p className="text-xs text-gray-500">{request.createdAt}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${priorityColors[request.priority]}`}>
                                                        {request.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${statusColors[request.status]}`}>
                                                        {request.status.replace("_", " ").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-white font-bold">{request.peopleCount}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/coordinator/requests/${request.id}`}
                                                            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-bold transition-all"
                                                        >
                                                            View
                                                        </Link>
                                                        {request.status === "pending" && (
                                                            <button className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-bold transition-all">
                                                                Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Empty State */}
                        {filteredRequests.length === 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-white mb-2">No requests found</h3>
                                <p className="text-gray-400">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
