"use client";

import { useEffect } from "react";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiCornerUpLeft,
  FiInbox,
  FiMail,
  FiRefreshCw,
  FiSettings,
  FiSlash,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import { useNotificationStore } from "@/store/useNotification.store";
import { useAuthStore } from "@/store/useAuth.store";

// Maps notification type → UI presentation
const TYPE_META: Record<
  string,
  {
    uiType: "success" | "warning" | "info" | "emergency";
    title: string;
    icon: IconType;
  }
> = {
  SUBMITTED: { uiType: "info", title: "Yêu cầu đã được gửi", icon: FiMail },
  ACCEPTED: {
    uiType: "success",
    title: "Yêu cầu được tiếp nhận",
    icon: FiCheckCircle,
  },
  IN_PROGRESS: {
    uiType: "warning",
    title: "Đội cứu hộ đang xử lý",
    icon: FiSettings,
  },
  COMPLETED: {
    uiType: "success",
    title: "Yêu cầu đã hoàn thành",
    icon: FiCheckCircle,
  },
  REJECTED: { uiType: "emergency", title: "Yêu cầu bị từ chối", icon: FiXCircle },
  CANCELLED: {
    uiType: "warning",
    title: "Yêu cầu đã được hủy",
    icon: FiSlash,
  },
  WITHDRAWN: { uiType: "warning", title: "Đội cứu hộ đã rút", icon: FiCornerUpLeft },
};

const NOTIFICATION_STYLES = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    dot: "bg-green-400",
    icon: "text-green-300",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
    icon: "text-yellow-300",
  },
  emergency: {
    bg: "bg-red-500/10",
    border: "border-red-500/30 border-l-4 border-l-red-500",
    dot: "bg-red-400",
    icon: "text-red-300",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
    icon: "text-blue-300",
  },
} as const;

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

export default function CitizenNotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    deleteAll,
    fetchNotifications,
  } = useNotificationStore();

  const userId = user?._id || user?.id || "";

  // Initial fetch (socket may already have fetched, but ensure data is loaded)
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

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
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  if (userId) deleteAll(userId);
                }}
                className="text-sm text-[#FF7700] hover:text-[#FF8800] font-bold underline underline-offset-2"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiTrash2 /> Xoá tất cả
                </span>
              </button>
            )}
            <button
              onClick={() => {
                if (userId) fetchNotifications();
              }}
              className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              aria-label="Làm mới thông báo"
            >
              <FiRefreshCw className="text-xl inline-block" />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-5">
          {/* Content */}
          {notifications.length === 0 ?
            <div className="text-center py-16">
              <div className="mb-4 flex justify-center">
                <FiInbox className="text-6xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Chưa có thông báo nào
              </h3>
              <p className="text-gray-400 mb-6">Thông báo mới sẽ hiện ở đây</p>
            </div>
            : <div className="space-y-3">
              {notifications.map((noti) => {
                const meta = TYPE_META[noti.type];
                const uiType = meta?.uiType ?? "info";
                const style = NOTIFICATION_STYLES[uiType];
                const Icon = meta?.icon ?? FiBell;
                const title = meta?.title ?? "Thông báo";

                return (
                  <div
                    key={noti._id}
                    onClick={() => !noti.isRead && markAsRead(noti._id)}
                    className={`${style.bg} border ${style.border} rounded-xl p-5 transition-all duration-200 ${!noti.isRead ?
                        "cursor-pointer hover:brightness-110 ring-1 ring-[#FF7700]/20"
                        : "opacity-80"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`text-2xl flex-shrink-0 mt-0.5 ${style.icon}`}>
                        <Icon />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-white leading-snug">
                            {title}
                          </h3>
                          {!noti.isRead && (
                            <span
                              className={`w-2 h-2 ${style.dot} rounded-full flex-shrink-0 mt-1.5 animate-pulse`}
                            />
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                          {noti.message}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                            <FiClock /> {toRelativeTime(noti.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(noti._id);
                            }}
                            className="text-xs font-bold text-red-400/60 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg transition-all"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <FiTrash2 /> Xoá
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      </main>
    </>
  );
}
