"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

interface Team {
    id: string;
    name: string;
    status: "available" | "busy" | "offline";
    memberCount: number;
    currentMission?: string;
    location: string;
}

export default function TeamsPage() {
    const [teams] = useState<Team[]>([
        {
            id: "TEAM001",
            name: "Team Alpha",
            status: "available",
            memberCount: 5,
            location: "Quận 1, TP.HCM",
        },
        {
            id: "TEAM002",
            name: "Team Bravo",
            status: "busy",
            memberCount: 6,
            currentMission: "REQ123",
            location: "Quận 5, TP.HCM",
        },
        {
            id: "TEAM003",
            name: "Team Charlie",
            status: "available",
            memberCount: 4,
            location: "Quận 3, TP.HCM",
        },
    ]);

    const statusColors = {
        available: "bg-green-500/20 text-green-400 border-green-500/30",
        busy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        offline: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader
                    title="Rescue Teams"
                    subtitle="Quản lý đội cứu hộ và phân công nhiệm vụ"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                                <div className="text-3xl font-bold text-green-400 mb-2">
                                    {teams.filter((t) => t.status === "available").length}
                                </div>
                                <p className="text-sm text-gray-400">Available</p>
                            </div>
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                                <div className="text-3xl font-bold text-orange-400 mb-2">
                                    {teams.filter((t) => t.status === "busy").length}
                                </div>
                                <p className="text-sm text-gray-400">On Mission</p>
                            </div>
                            <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6">
                                <div className="text-3xl font-bold text-gray-400 mb-2">
                                    {teams.filter((t) => t.status === "offline").length}
                                </div>
                                <p className="text-sm text-gray-400">Offline</p>
                            </div>
                        </div>

                        {/* Teams List */}
                        <div className="grid grid-cols-1 gap-4">
                            {teams.map((team) => (
                                <div key={team.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">{team.name}</h3>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusColors[team.status]}`}>
                                                    {team.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span>👥 {team.memberCount} members</span>
                                                <span>📍 {team.location}</span>
                                                {team.currentMission && (
                                                    <span>🚁 Mission: #{team.currentMission}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/coordinator/teams/${team.id}`}
                                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-bold transition-all"
                                            >
                                                View Details
                                            </Link>
                                            {team.status === "available" && (
                                                <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl font-bold transition-all">
                                                    Assign Mission
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
