"use client";

import { useState, useEffect } from "react";
import type { RescueTeam } from "../../domain/mission.entity";

interface AddTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teamIds: string[], note?: string) => Promise<void>;
  teams: RescueTeam[];
  loading?: boolean;
}

export default function AddTeamsModal({
  isOpen,
  onClose,
  onAdd,
  teams,
  loading = false,
}: AddTeamsModalProps) {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTeams(new Set());
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedTeams.size === 0) return;
    setSubmitting(true);
    try {
      await onAdd(Array.from(selectedTeams), note || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to add teams:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTeam = (id: string) => {
    const newSet = new Set(selectedTeams);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTeams(newSet);
  };

  const availableTeams = teams.filter(
    (t) =>
      t.status === "AVAILABLE" ||
      t.status === "Available" ||
      t.status === "available",
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-1">👥 Thêm Đội Cứu Hộ/Cứu Trợ</h2>
        <p className="text-gray-400 text-sm mb-4">
          Chọn các đội sẽ tham gia vào nhiệm vụ này
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Team Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Danh sách Đội Khả dụng (AVAILABLE) *
              </label>

              <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                {availableTeams.length === 0 ? (
                  <p className="text-yellow-400 text-sm text-center py-4">
                    ⚠️ Không có đội nào khả dụng
                  </p>
                ) : (
                  availableTeams.map((team) => (
                    <label 
                      key={team._id} 
                      className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedTeams.has(team._id)}
                        onChange={() => toggleTeam(team._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {team.name}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          Trạng thái: <span className="text-green-400">{team.status}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Cần mang theo xuồng máy"
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedTeams.size === 0 || submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {submitting ? "Đang thêm..." : `✅ Thêm ${selectedTeams.size} đội`}
          </button>
        </div>
      </div>
    </div>
  );
}
