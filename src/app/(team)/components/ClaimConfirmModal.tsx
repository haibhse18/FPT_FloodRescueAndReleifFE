"use client";

import { FaBoxOpen, FaTimes } from "react-icons/fa";

interface ClaimConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supply: {
    name: string;
    quantity: number;
    unit: string;
    warehouseName: string;
  };
  loading?: boolean;
}

export default function ClaimConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  supply,
  loading = false,
}: ClaimConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-mission-bg-primary border border-mission-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mission-border">
          <h3 className="text-lg font-bold text-mission-text-primary">
            Xác nhận nhận vật tư
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-mission-text-muted hover:text-mission-text-primary transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-mission-bg-secondary rounded-xl border border-mission-border">
            <div className="w-12 h-12 rounded-lg bg-mission-status-warning/20 flex items-center justify-center flex-shrink-0">
              <FaBoxOpen className="text-mission-icon-supplies text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-mission-text-muted mb-1">
                Bạn xác nhận đã nhận đủ:
              </p>
              <p className="text-lg font-bold text-mission-text-primary">
                {supply.quantity} {supply.unit} {supply.name}
              </p>
              <p className="text-xs text-mission-text-subtle mt-1">
                từ {supply.warehouseName}
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-200/90">
              ⚠️ Sau khi xác nhận, bạn sẽ chịu trách nhiệm về số lượng vật tư này.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-mission-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-mission-text-primary font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              '✓ Xác nhận nhận hàng'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
