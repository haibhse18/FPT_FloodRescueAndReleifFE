"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";
import type { Team, TeamMember } from "@/modules/teams/domain/team.entity";
import AddMemberModal from "../components/AddMemberModal";
import { Modal } from "@/shared/ui/components";

interface TeamDetailPageProps {
  teamId: string;
  /** true = Coordinator (full control), false = Team Leader (limited) */
  isCoordinator?: boolean;
}

export default function TeamDetailPage({
  teamId,
  isCoordinator = true,
}: TeamDetailPageProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamRepository.getTeamById(teamId);
      setTeam(data);
      setNewName(data.name);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin đội");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // ── Actions ─────────────────────────────────────────────

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === team?.name) {
      setEditingName(false);
      return;
    }
    setActionLoading("name");
    try {
      await teamRepository.updateTeam(teamId, { name: newName.trim() });
      toast.success("Cập nhật tên đội thành công!");
      setEditingName(false);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật tên");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeLeader = async (memberId: string) => {
    if (team?.status !== "AVAILABLE") {
      toast.error("Chỉ có thể đổi leader khi team đang AVAILABLE");
      return;
    }
    if (!confirm("Bạn có chắc muốn đổi leader?")) return;
    setActionLoading("leader");
    try {
      await teamRepository.changeLeader(teamId, { leaderId: memberId });
      toast.success("Đổi leader thành công!");
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đổi leader");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (member._id === team?.leaderId) {
      toast.error("Không thể xoá leader. Hãy đổi leader trước.");
      return;
    }
    if (
      !confirm(
        `Bạn có chắc muốn xoá "${member.displayName || member.userName}" khỏi đội?`,
      )
    )
      return;
    setActionLoading(`remove-${member._id}`);
    try {
      await teamRepository.removeMember(teamId, member._id);
      toast.success(
        `Đã xoá "${member.displayName || member.userName}" khỏi đội`,
      );
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xoá thành viên");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (team.status !== "AVAILABLE") {
      toast.error("Chỉ có thể xoá team khi status = AVAILABLE");
      return;
    }
    if (team.members && team.members.length > 0) {
      toast.error("Phải xoá hết thành viên trước khi xoá team");
      return;
    }
    // Instead of confirm() open the modal
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTeam = async () => {
    if (!team) return;
    setActionLoading("delete");
    try {
      await teamRepository.deleteTeam(teamId);
      toast.success("Đã xoá đội thành công!");
      router.push("/team-control");
    } catch (err: any) {
      // Detect active-timeline / active-mission errors from BE (400)
      const raw: string = (
        err?.response?.data?.message ||
        err?.message ||
        ""
      ).toLowerCase();
      const isActiveTimeline =
        raw.includes("timeline") ||
        raw.includes("active") ||
        raw.includes("mission") ||
        raw.includes("assigned") ||
        raw.includes("en_route") ||
        raw.includes("on_site");

      toast.error(
        isActiveTimeline ?
          "Không thể xóa do Team đang thực hiện nhiệm vụ"
        : err?.response?.data?.message || err.message || "Lỗi khi xoá đội",
      );
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleMemberAdded = () => {
    setShowAddMember(false);
    fetchTeam();
  };

  // ── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 inline-block">
          <p className="text-red-200 text-lg">
            ⚠️ {error || "Không tìm thấy đội"}
          </p>
          <button
            onClick={fetchTeam}
            className="mt-3 text-sm text-blue-400 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const leader = team.members?.find((m) => m._id === team.leaderId);
  const isAvailable = team.status === "AVAILABLE";
  const memberCount = team.members?.length || 0;
  const canDelete = isCoordinator && isAvailable && memberCount === 0;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto relative z-10">
      {/* Back Button */}
      <button
        onClick={() =>
          router.push(isCoordinator ? "/team-control" : "/my-team")
        }
        className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
      >
        ← Quay lại
      </button>

      {/* Team Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            {editingName ?
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xl font-bold focus:outline-none focus:border-[#FF7700]"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  disabled={actionLoading === "name"}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  ✅
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName(team.name);
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>
            : <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                {isCoordinator && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                    title="Đổi tên"
                  >
                    ✏️
                  </button>
                )}
              </div>
            }

            <div className="flex flex-wrap gap-3 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isAvailable ?
                    "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {isAvailable ? "🟢 Sẵn sàng" : "🔴 Đang bận"}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                👤 Leader:{" "}
                {leader?.displayName || leader?.userName || "Chưa chỉ định"}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                👥 {memberCount} / 100 thành viên
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowAddMember(true)}
              disabled={memberCount >= 100}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
            >
              ➕ Thêm thành viên
            </button>
            {isCoordinator && (
              <button
                onClick={handleDeleteTeam}
                disabled={!canDelete || actionLoading === "delete"}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-30 text-red-300 border border-red-500/30 rounded-lg text-sm font-bold transition-colors"
                title={
                  !canDelete ? "Cần AVAILABLE + 0 thành viên để xoá" : "Xoá đội"
                }
              >
                🗑️ Xoá đội
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          👥 Danh sách thành viên ({memberCount})
        </h2>

        {!team.members || team.members.length === 0 ?
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🫥</div>
            <p className="text-gray-400">Đội chưa có thành viên nào</p>
            <p className="text-gray-500 text-sm mt-1">
              Nhấn &quot;Thêm thành viên&quot; để bắt đầu
            </p>
          </div>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left py-3 px-2">Tên</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">SĐT</th>
                  <th className="text-left py-3 px-2">Vai trò</th>
                  <th className="text-right py-3 px-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => {
                  const isLeader = member._id === team.leaderId;
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
                      <td className="py-3 px-2 text-gray-400">
                        {member.email}
                      </td>
                      <td className="py-3 px-2 text-gray-400">
                        {member.phoneNumber || "—"}
                      </td>
                      <td className="py-3 px-2 text-gray-400">{member.role}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Change Leader button (only Coordinator, only when AVAILABLE) */}
                          {isCoordinator && !isLeader && isAvailable && (
                            <button
                              onClick={() => handleChangeLeader(member._id)}
                              disabled={actionLoading === "leader"}
                              className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs transition-colors"
                              title="Đặt làm Leader"
                            >
                              ⭐ Leader
                            </button>
                          )}
                          {/* Remove button (not for leader, not for self if not coordinator) */}
                          {!isLeader && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              disabled={
                                actionLoading === `remove-${member._id}`
                              }
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors disabled:opacity-50"
                              title="Xoá khỏi đội"
                            >
                              🗑️ Xoá
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdded={handleMemberAdded}
        teamId={teamId}
      />

      {/* Delete Team Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận xoá đội"
        icon="🗑️"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={confirmDeleteTeam}
              disabled={actionLoading === "delete"}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-500/20"
            >
              {actionLoading === "delete" ? "Đang xoá..." : "Xác nhận xoá"}
            </button>
          </div>
        }
      >
        <div className="text-gray-300">
          Bạn có chắc chắn muốn xoá đội{" "}
          <span className="text-white font-bold">{team.name}</span> vĩnh viễn
          không?
          <p className="mt-2 text-sm text-red-300/80">
            Cảnh báo: Hành động này không thể hoàn tác!
          </p>
        </div>
      </Modal>
    </div>
  );
}
