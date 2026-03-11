"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuth.store";
import { timelineRepository } from "@/modules/timelines/infrastructure/timeline.repository.impl";
import type { Timeline, TimelineStatus } from "@/modules/timelines/domain/timeline.entity";
import type { TimelineCompleteInput } from "@/modules/timelines/domain/timeline.entity";
import { Modal } from "@/shared/ui/components";

// ─── Status labels & badge styles ────────────────────────

const STATUS_LABEL: Record<TimelineStatus, string> = {
  ASSIGNED: "Đã phân công",
  EN_ROUTE: "Đang đi",
  ON_SITE: "Đã đến hiện trường",
  COMPLETED: "Hoàn thành",
  PARTIAL: "Một phần",
  FAILED: "Thất bại",
  WITHDRAWN: "Đã rút",
  CANCELLED: "Đã hủy",
};

const STATUS_BADGE: Record<TimelineStatus, string> = {
  ASSIGNED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  EN_ROUTE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ON_SITE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
  PARTIAL: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
  WITHDRAWN: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// ─── Component ────────────────────────────────────────────

export default function TeamMissionsPage() {
  const { user } = useAuthStore();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [completeTarget, setCompleteTarget] = useState<Timeline | null>(null);
  const [failTarget, setFailTarget] = useState<Timeline | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Timeline | null>(null);

  const teamId =
    typeof user?.teamId === "string"
      ? user.teamId
      : (user?.teamId as { _id?: string } | undefined)?._id;

  const fetchTimelines = useCallback(async () => {
    if (!teamId) {
      setTimelines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await timelineRepository.getTimelines({
        teamId,
        limit: 50,
        page: 1,
      });
      setTimelines(result.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải nhiệm vụ");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  const handleAccept = async (t: Timeline) => {
    setActionLoading(t._id);
    try {
      await timelineRepository.acceptTimeline(t._id);
      toast.success("Đã nhận nhiệm vụ. Trạng thái: Đang đi.");
      fetchTimelines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể nhận nhiệm vụ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArrive = async (t: Timeline) => {
    setActionLoading(t._id);
    try {
      await timelineRepository.arriveTimeline(t._id);
      toast.success("Đã cập nhật: Đã đến hiện trường.");
      fetchTimelines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSubmit = async (payload: TimelineCompleteInput) => {
    if (!completeTarget) return;
    setActionLoading(completeTarget._id);
    try {
      await timelineRepository.completeTimeline(completeTarget._id, payload);
      toast.success("Đã báo cáo hoàn thành nhiệm vụ.");
      setCompleteTarget(null);
      fetchTimelines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi báo cáo");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFailSubmit = async (failureReason: string, note?: string) => {
    if (!failTarget) return;
    setActionLoading(failTarget._id);
    try {
      await timelineRepository.failTimeline(failTarget._id, { failureReason, note });
      toast.success("Đã báo cáo thất bại.");
      setFailTarget(null);
      fetchTimelines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi báo cáo");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdrawSubmit = async (withdrawalReason: string, note?: string) => {
    if (!withdrawTarget) return;
    setActionLoading(withdrawTarget._id);
    try {
      await timelineRepository.withdrawTimeline(withdrawTarget._id, {
        withdrawalReason,
        note,
      });
      toast.success("Đã rút khỏi nhiệm vụ.");
      setWithdrawTarget(null);
      fetchTimelines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể rút");
    } finally {
      setActionLoading(null);
    }
  };

  if (!teamId) {
    return (
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
              📋 Nhiệm vụ
            </h1>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-300 text-lg">Bạn chưa thuộc đội nào</p>
            <p className="text-gray-400 text-sm mt-2">
              Liên hệ Coordinator để được thêm vào đội cứu hộ
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
                📋 Nhiệm vụ
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">
                  {timelines.length} nhiệm vụ
                </span>
              </div>
            </div>
            <button
              onClick={fetchTimelines}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tải...
                </span>
              ) : (
                "🔄 Làm mới"
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        <div className="relative p-4 lg:p-8 max-w-7xl mx-auto space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              <p className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
              <button
                onClick={fetchTimelines}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-300 text-lg">Đang tải nhiệm vụ...</p>
            </div>
          )}

          {!loading && !error && timelines.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-300 text-lg">Chưa có nhiệm vụ nào được phân công</p>
              <p className="text-gray-400 text-sm mt-2">
                Khi Coordinator phân công, nhiệm vụ sẽ hiển thị tại đây
              </p>
            </div>
          )}

          {!loading && !error && timelines.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {timelines.map((t) => {
                const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.ASSIGNED;
                const label = STATUS_LABEL[t.status];
                const isBusy = actionLoading === t._id;
                const canAccept = t.status === "ASSIGNED";
                const canArrive = t.status === "EN_ROUTE";
                const canCompleteOrFail = t.status === "ON_SITE";
                const canWithdraw = t.status === "ASSIGNED";

                return (
                  <div
                    key={t._id}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-xs font-mono">#{t._id.slice(-6)}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${badge}`}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1 mb-4">
                      <p>Request: {t.requestId?.slice(-8) ?? "—"}</p>
                      <p>Phân công lúc: {t.assignedAt ? new Date(t.assignedAt).toLocaleString("vi-VN") : "—"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canAccept && (
                        <button
                          onClick={() => handleAccept(t)}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                        >
                          {isBusy ? "..." : "✅ Nhận nhiệm vụ"}
                        </button>
                      )}
                      {canWithdraw && (
                        <button
                          onClick={() => setWithdrawTarget(t)}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                        >
                          Từ chối / Rút
                        </button>
                      )}
                      {canArrive && (
                        <button
                          onClick={() => handleArrive(t)}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                        >
                          {isBusy ? "..." : "📍 Đã đến hiện trường"}
                        </button>
                      )}
                      {canCompleteOrFail && (
                        <>
                          <button
                            onClick={() => setCompleteTarget(t)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                          >
                            Hoàn thành
                          </button>
                          <button
                            onClick={() => setFailTarget(t)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                          >
                            Báo thất bại
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Complete Modal */}
      {completeTarget && (
        <CompleteModal
          timeline={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onSubmit={handleCompleteSubmit}
          loading={actionLoading === completeTarget._id}
        />
      )}

      {/* Fail Modal */}
      {failTarget && (
        <FailModal
          timeline={failTarget}
          onClose={() => setFailTarget(null)}
          onSubmit={handleFailSubmit}
          loading={actionLoading === failTarget._id}
        />
      )}

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <WithdrawModal
          timeline={withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          onSubmit={handleWithdrawSubmit}
          loading={actionLoading === withdrawTarget._id}
        />
      )}
    </div>
  );
}

// ─── Complete Modal ────────────────────────────────────────

function CompleteModal({
  timeline,
  onClose,
  onSubmit,
  loading,
}: {
  timeline: Timeline;
  onClose: () => void;
  onSubmit: (payload: TimelineCompleteInput) => void;
  loading: boolean;
}) {
  const [outcome, setOutcome] = useState<"COMPLETED" | "PARTIAL">("COMPLETED");
  const [rescuedCount, setRescuedCount] = useState<string>("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      outcome,
      rescuedCount: rescuedCount === "" ? undefined : parseInt(rescuedCount, 10),
      note: note.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Báo cáo hoàn thành"
      icon="✅"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="complete-form"
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-bold"
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      }
    >
      <form id="complete-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-400 text-sm">Timeline #{timeline._id.slice(-6)}</p>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Kết quả *</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as "COMPLETED" | "PARTIAL")}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="COMPLETED">COMPLETED — Cứu hết</option>
            <option value="PARTIAL">PARTIAL — Cứu một phần</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Số người đã cứu (tùy chọn)</label>
          <input
            type="number"
            min={0}
            value={rescuedCount}
            onChange={(e) => setRescuedCount(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Fail Modal ────────────────────────────────────────────

function FailModal({
  timeline,
  onClose,
  onSubmit,
  loading,
}: {
  timeline: Timeline;
  onClose: () => void;
  onSubmit: (failureReason: string, note?: string) => void;
  loading: boolean;
}) {
  const [failureReason, setFailureReason] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failureReason.trim()) return;
    onSubmit(failureReason.trim(), note.trim() || undefined);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Báo cáo thất bại"
      icon="❌"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="fail-form"
            disabled={loading || !failureReason.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold"
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      }
    >
      <form id="fail-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-400 text-sm">Timeline #{timeline._id.slice(-6)}</p>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Lý do thất bại *</label>
          <textarea
            value={failureReason}
            onChange={(e) => setFailureReason(e.target.value)}
            required
            rows={3}
            placeholder="VD: Đường ngập không thể tiếp cận..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Withdraw Modal ────────────────────────────────────────

function WithdrawModal({
  timeline,
  onClose,
  onSubmit,
  loading,
}: {
  timeline: Timeline;
  onClose: () => void;
  onSubmit: (withdrawalReason: string, note?: string) => void;
  loading: boolean;
}) {
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalReason.trim()) return;
    onSubmit(withdrawalReason.trim(), note.trim() || undefined);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Rút khỏi nhiệm vụ"
      icon="↩️"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="withdraw-form"
            disabled={loading || !withdrawalReason.trim()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold"
          >
            {loading ? "Đang gửi..." : "Xác nhận rút"}
          </button>
        </div>
      }
    >
      <form id="withdraw-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-400 text-sm">Timeline #{timeline._id.slice(-6)}</p>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Lý do rút *</label>
          <textarea
            value={withdrawalReason}
            onChange={(e) => setWithdrawalReason(e.target.value)}
            required
            rows={3}
            placeholder="VD: Thiết bị không đủ..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
