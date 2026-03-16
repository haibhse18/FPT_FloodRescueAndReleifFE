"use client";

import { useState, useEffect } from "react";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";

interface AddRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (requestIds: string[], note?: string) => Promise<void>;
  requests: CoordinatorRequest[];
  loading?: boolean;
}

export default function AddRequestsModal({
  isOpen,
  onClose,
  onAdd,
  requests,
  loading = false,
}: AddRequestsModalProps) {
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedRequests(new Set());
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRequests.size === 0) return;
    setSubmitting(true);
    try {
      await onAdd(Array.from(selectedRequests), note || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to add requests:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRequest = (id: string) => {
    const newSet = new Set(selectedRequests);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRequests(newSet);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white mb-1">📋 Thêm Yêu cầu (Request)</h2>
        <p className="text-gray-400 text-sm mb-4">
          Chọn các yêu cầu cần xử lý trong nhiệm vụ này
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Request Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Danh sách Yêu cầu đã xác minh (VERIFIED) *
              </label>
              
              <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                {requests.length === 0 ? (
                  <p className="text-yellow-400 text-sm text-center py-4">
                    ⚠️ Không có yêu cầu VERIFIED nào
                  </p>
                ) : (
                  requests.map((req) => (
                    <label 
                      key={req._id} 
                      className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedRequests.has(req._id)}
                        onChange={() => toggleRequest(req._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {req.userName || "N/A"} — <span className="text-gray-400">{req.type}</span>
                        </div>
                        <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {req.description}
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
                placeholder="VD: Ưu tiên cứu hộ vùng trũng thấp"
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
            disabled={selectedRequests.size === 0 || submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {submitting ? "Đang thêm..." : `✅ Thêm ${selectedRequests.size} yêu cầu`}
          </button>
        </div>
      </div>
    </div>
  );
}
