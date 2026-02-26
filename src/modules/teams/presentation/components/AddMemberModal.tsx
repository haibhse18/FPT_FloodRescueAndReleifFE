"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";
import type { TeamMember } from "@/modules/teams/domain/team.entity";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  teamId: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onAdded,
  teamId,
}: AddMemberModalProps) {
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await teamRepository.getAvailableMembers();
        setAvailableUsers(users);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (userId: string) => {
    setAdding(userId);
    try {
      await teamRepository.addMember(teamId, { userId });
      toast.success("Thêm thành viên thành công!");
      // Remove from local list
      setAvailableUsers((prev) => prev.filter((u) => u._id !== userId));
      onAdded();
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm thành viên");
    } finally {
      setAdding(null);
    }
  };

  const filteredUsers = availableUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.userName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phoneNumber || "").includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold text-white mb-1">
          ➕ Thêm thành viên
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Chọn người dùng (Rescue Team chưa có đội) để thêm vào đội
        </p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo tên, email, SĐT..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF7700] mb-4"
        />

        {/* Content */}
        <div className="flex-1 overflow-auto space-y-2 min-h-0">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF7700]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🫥</div>
              <p className="text-gray-400 text-sm">
                Không có người dùng phù hợp
              </p>
            </div>
          )}

          {!loading &&
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.displayName || user.userName}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user.email}
                    {user.phoneNumber ? ` • ${user.phoneNumber}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(user._id)}
                  disabled={adding === user._id}
                  className="ml-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                >
                  {adding === user._id ? "..." : "➕ Thêm"}
                </button>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              setSearch("");
              onClose();
            }}
            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
