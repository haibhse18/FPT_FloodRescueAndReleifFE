"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GetNotificationsUseCase } from "@/modules/notifications/application/getNotifications.usecase";
import { MarkNotificationReadUseCase } from "@/modules/notifications/application/markNotificationRead.usecase";
import { notificationRepository } from "@/modules/notifications/infrastructure/notification.repository.impl";

// Initialize use cases with repository
const getNotificationsUseCase = new GetNotificationsUseCase(
  notificationRepository,
);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(
  notificationRepository,
);

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "emergency";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionLink?: string;
}

// Helper: convert ISO date → relative time string
function toRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  } catch {
    return isoString;
  }
}

// Maps API status type → { uiType, title, actionLabel, actionLink }
// API type enum: SUBMITTED, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
const STATUS_META: Record<
  string,
  {
    uiType: "success" | "warning" | "info" | "emergency";
    title: string;
    actionLabel?: string;
    actionLink?: string;
  }
> = {
  SUBMITTED: {
    uiType: "info",
    title: "Yêu cầu đã được gửi",
    actionLabel: "Xem lịch sử",
    actionLink: "/history",
  },
  ACCEPTED: {
    uiType: "success",
    title: "Yêu cầu được tiếp nhận",
    actionLabel: "Theo dõi",
    actionLink: "/history",
  },
  IN_PROGRESS: {
    uiType: "warning",
    title: "Đội cứu hộ đang xử lý",
    actionLabel: "Theo dõi",
    actionLink: "/history",
  },
  COMPLETED: {
    uiType: "success",
    title: "Yêu cầu đã hoàn thành",
    actionLabel: "Xem chi tiết",
    actionLink: "/history",
  },
  REJECTED: {
    uiType: "emergency",
    title: "Yêu cầu bị từ chối",
    actionLabel: "Gửi lại",
    actionLink: "/request",
  },
  CANCELLED: {
    uiType: "warning",
    title: "Yêu cầu đã được hủy",
    actionLabel: "Xem lịch sử",
    actionLink: "/history",
  },
};

// Helper: map raw API data → Notification UI model
function mapApiToNotification(raw: any): Notification {
  const apiType = (raw.type || raw.notificationType || "").toUpperCase();
  const meta = STATUS_META[apiType];
  return {
    id: raw._id || raw.id || raw.notificationId || "",
    type: meta?.uiType ?? "info",
    title: raw.title || meta?.title || "Thông báo",
    message: raw.message || raw.content || raw.body || "",
    timestamp: toRelativeTime(raw.createdAt || raw.created_at || ""),
    isRead: raw.isRead ?? raw.is_read ?? false,
    actionLabel: raw.actionLabel || meta?.actionLabel,
    actionLink: raw.actionLink || meta?.actionLink,
  };
}

const NOTIFICATION_STYLES = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: "✅",
    dot: "bg-green-400",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: "⚠️",
    dot: "bg-yellow-400",
  },
  emergency: {
    bg: "bg-red-500/10",
    border: "border-red-500/30 border-l-4 border-l-red-500",
    icon: "🚨",
    dot: "bg-red-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "ℹ️",
    dot: "bg-blue-400",
  },
} as const;

export default function CitizenNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const data = await getNotificationsUseCase.execute();
      const rawList = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setNotifications(rawList.map(mapApiToNotification));
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update first
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await markNotificationReadUseCase.execute(id);
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  };

  const markAllAsRead = async () => {
    const prev = notifications;
    setNotifications((n) => n.map((item) => ({ ...item, isRead: true })));
    try {
      await markNotificationReadUseCase.executeAll();
    } catch {
      setNotifications(prev);
    }
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 p-4 lg:p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl lg:text-2xl font-extrabold mb-0.5 flex items-center gap-2">
              Thông báo
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-black bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-white/70 text-xs lg:text-sm">
              Cập nhật quan trọng về cứu hộ
            </p>
          </div>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={isRefreshing}
            className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50"
            aria-label="Làm mới thông báo"
          >
            <span
              className={`text-xl inline-block ${isRefreshing ? "animate-spin" : ""}`}
            >
              🔄
            </span>
          </button>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-5">

          {/* Filter + Mark All */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === "all"
                  ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
              >
                📋 Tất cả
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === "all" ? "bg-white/20" : "bg-white/10"
                    }`}
                >
                  {notifications.length}
                </span>
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${filter === "unread"
                  ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
              >
                🔴 Chưa đọc
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === "unread" ? "bg-white/20" : "bg-white/10"
                    }`}
                >
                  {unreadCount}
                </span>
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#FF7700] hover:text-[#FF8800] font-bold underline underline-offset-2"
              >
                ✓ Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            // Skeleton matching card shape
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                      <div className="flex justify-between mt-3">
                        <div className="h-3 bg-white/10 rounded w-20" />
                        <div className="h-3 bg-white/10 rounded w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Đã xảy ra lỗi
              </h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => fetchNotifications()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] hover:bg-[#FF8800] rounded-xl text-white font-bold transition-all"
              >
                🔄 Thử lại
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === "unread"
                  ? "Đã đọc hết rồi!"
                  : "Chưa có thông báo nào"}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo"
                  : "Thông báo mới sẽ hiện ở đây"}
              </p>
              {filter === "unread" && (
                <button
                  onClick={() => setFilter("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm transition-all"
                >
                  📋 Xem tất cả thông báo
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const style = NOTIFICATION_STYLES[notification.type];
                return (
                  <div
                    key={notification.id}
                    onClick={() =>
                      !notification.isRead && markAsRead(notification.id)
                    }
                    className={`${style.bg} border ${style.border} rounded-xl p-5 transition-all duration-200 ${!notification.isRead
                      ? "cursor-pointer hover:brightness-110 ring-1 ring-[#FF7700]/20"
                      : "opacity-80"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-white leading-snug">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span
                              className={`w-2 h-2 ${style.dot} rounded-full flex-shrink-0 mt-1.5 animate-pulse`}
                            />
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-gray-500">
                            🕐 {notification.timestamp}
                          </span>
                          {notification.actionLabel &&
                            notification.actionLink && (
                              <Link
                                href={notification.actionLink}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!notification.isRead)
                                    markAsRead(notification.id);
                                }}
                                className="text-xs font-bold text-[#FF7700] hover:text-[#FF8800] bg-[#FF7700]/10 hover:bg-[#FF7700]/20 px-3 py-1 rounded-lg transition-all"
                              >
                                {notification.actionLabel} →
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

