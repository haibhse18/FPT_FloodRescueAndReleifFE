"use client";

import { useState } from "react";
import { toast } from "sonner";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTeamModal({
  isOpen,
  onClose,
  onCreated,
}: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await teamRepository.createTeam({ name: name.trim() });
      toast.success("Tạo đội thành công! 🎉");
      setName("");
      onCreated();
    } catch (err: any) {
      const msg = err.message || "Không thể tạo đội";
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-1">➕ Tạo đội mới</h2>
        <p className="text-gray-400 text-sm mb-4">
          Tạo đội cứu hộ mới. Bạn có thể gán leader và thêm thành viên sau.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Tên đội *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đội cứu hộ khu vực A"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF7700]"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="flex-1 px-4 py-2 bg-[#FF7700] hover:bg-[#FF8820] disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
            >
              {submitting ? "Đang tạo..." : "✅ Tạo đội"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
