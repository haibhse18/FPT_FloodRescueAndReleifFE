"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";
import type { Team } from "@/modules/teams/domain/team.entity";

interface TeamMyTeamPageProps {
  teamId: string;
}

export default function TeamMyTeamPage({ teamId }: TeamMyTeamPageProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamRepository.getTeamById(teamId);
      setTeam(data);
    } catch (err: any) {
      setError(err?.message || "Khong the tai thong tin doi");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const leaderId = useMemo(() => {
    if (!team) return null;
    if (team.teamLeader?._id) return team.teamLeader._id;
    if (typeof team.leaderId === "string") return team.leaderId;
    return (team.leaderId as any)?._id ?? null;
  }, [team]);

  const leader = useMemo(() => {
    if (!team) return null;
    return team.teamLeader || team.members?.find((m) => m._id === leaderId) || null;
  }, [team, leaderId]);

  if (loading) {
    return (
      <div className="relative z-10 p-8 pb-24 lg:pb-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="relative z-10 p-8 pb-24 lg:pb-8 text-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 inline-block">
          <p className="text-red-200 text-lg">⚠️ {error || "Khong tim thay doi"}</p>
          <button
            onClick={fetchTeam}
            className="mt-3 text-sm text-blue-400 underline hover:no-underline"
          >
            Thu lai
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = team.status === "AVAILABLE";
  const memberCount = team.memberStats?.total || team.members?.length || 0;

  return (
    <div className="relative z-10 p-4 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{team.name}</h1>

            <div className="flex flex-wrap gap-3 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isAvailable
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {isAvailable ? "🟢 San sang" : "🔴 Dang ban"}
              </span>
              <span className="text-gray-300 text-sm flex items-center gap-1">
                👤 Leader: {leader?.displayName || leader?.userName || "Chua chi dinh"}
              </span>
              <span className="text-gray-300 text-sm flex items-center gap-1">
                👥 {memberCount} / 100 thanh vien
                {team.memberStats && (
                  <span className="text-green-400 ml-1">({team.memberStats.active} active)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          👥 Danh sach thanh vien ({memberCount})
        </h2>

        {!team.members || team.members.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🫥</div>
            <p className="text-gray-300">Doi chua co thanh vien nao</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-300">
                  <th className="text-left py-3 px-2">Ten</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">SDT</th>
                  <th className="text-left py-3 px-2">Vai tro</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => {
                  const isLeader = member._id === leaderId;
                  return (
                    <tr
                      key={member._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {member.displayName || member.userName}
                          </span>
                          {isLeader && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                              ⭐ Leader
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-300">{member.email}</td>
                      <td className="py-3 px-2 text-gray-300">{member.phoneNumber || "-"}</td>
                      <td className="py-3 px-2 text-gray-300">
                        {isLeader ? "Team leader" : "Team member"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
