"use client";

import { useState, useEffect } from "react";
import type { RescueTeam } from "../../domain/mission.entity";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (teamId: string, requestId: string, note?: string) => Promise<void>;
  teams: RescueTeam[];
  requests: CoordinatorRequest[];
  loading?: boolean;
}

export default function AssignTeamModal({
  isOpen,
  onClose,
  onAssign,
  teams,
  requests,
  loading = false,
}: AssignTeamModalProps) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTeam("");
      setSelectedRequest("");
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedTeam || !selectedRequest) return;
    setSubmitting(true);
    try {
      await onAssign(selectedTeam, selectedRequest, note || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to assign team:", error);
      alert("Phân công thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const availableTeams = teams.filter(
    (t) =>
      t.status === "AVAILABLE" ||
      t.status === "Available" ||
      t.status === "available",
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white mb-1">👥 Phân công đội</h2>
        <p className="text-gray-400 text-sm mb-4">
          Chọn đội cứu hộ và yêu cầu để tạo Timeline
        </p>

        {loading ?
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        : <div className="space-y-4">
            {/* Team Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Đội cứu hộ *
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-gray-800">
                  -- Chọn đội --
                </option>
                {availableTeams.map((team) => (
                  <option
                    key={team._id}
                    value={team._id}
                    className="bg-gray-800"
                  >
                    {team.name} ({team.status})
                  </option>
                ))}
              </select>
              {availableTeams.length === 0 && (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ Không có đội nào khả dụng
                </p>
              )}
            </div>

            {/* Request Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Yêu cầu cứu trợ *
              </label>
              <select
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-gray-800">
                  -- Chọn yêu cầu --
                </option>
                {requests.map((req) => (
                  <option key={req._id} value={req._id} className="bg-gray-800">
                    {req.userName || "N/A"} — {req.type} — {req.status}
                  </option>
                ))}
              </select>
              {requests.length === 0 && (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ Không có yêu cầu VERIFIED nào
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Ghi chú
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Ưu tiên cứu hộ, 1 người già"
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        }

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTeam || !selectedRequest || submitting}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {submitting ? "Đang phân công..." : "✅ Phân công"}
          </button>
        </div>
      </div>
    </div>
  );
}
