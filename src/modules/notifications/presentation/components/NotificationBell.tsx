"use client";

/**
 * NotificationBell — Bell icon với badge + dropdown danh sách thông báo.
 *
 * Sử dụng useNotificationStore (Zustand) để lấy data & actions.
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Trash2, CheckCheck, X } from "lucide-react";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiCheckCircle,
  FiCornerUpLeft,
  FiInbox,
  FiMail,
  FiSettings,
  FiSlash,
  FiXCircle,
} from "react-icons/fi";
import { useNotificationStore } from "@/store/useNotification.store";
import { useAuthStore } from "@/store/useAuth.store";

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

const TYPE_META: Record<string, { icon: IconType; color: string }> = {
  SUBMITTED: { icon: FiMail, color: "text-blue-300" },
  ACCEPTED: { icon: FiCheckCircle, color: "text-emerald-300" },
  REJECTED: { icon: FiXCircle, color: "text-red-300" },
  IN_PROGRESS: { icon: FiSettings, color: "text-amber-300" },
  COMPLETED: { icon: FiCheckCircle, color: "text-emerald-300" },
  CANCELLED: { icon: FiSlash, color: "text-rose-300" },
  WITHDRAWN: { icon: FiCornerUpLeft, color: "text-yellow-300" },
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    deleteAll,
  } = useNotificationStore();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Bell Icon */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative flex items-center rounded-lg bg-white/5 hover:bg-white/10 transition-all active:scale-95 border border-white/5 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0f2a3f] h-10 w-10"
        aria-label="Thông báo"
      >
        <div className="w-10 flex items-center justify-center flex-shrink-0 relative">
          <Bell className="h-5 w-5 text-white/80" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 text-[9px] font-bold bg-red-500 text-white rounded-full shadow-lg">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown - Rendered via Portal */}
      {mounted && open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-80 bg-[#0c1f2f] rounded-xl shadow-2xl border border-white/10 max-h-[28rem] overflow-hidden z-[9999] flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
            <h3 className="text-white font-bold text-sm">
              Thông báo{" "}
              {unreadCount > 0 && (
                <span className="text-xs text-red-400 ml-1">
                  ({unreadCount} chưa đọc)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    const userId = user?._id || user?.id;
                    if (userId) deleteAll(userId);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Xoá tất cả"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white/50" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-white/50" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ?
              <div className="p-8 text-center">
                <div className="mb-2 flex justify-center">
                  <FiInbox className="text-4xl text-white/40" />
                </div>
                <p className="text-white/50 text-sm">Không có thông báo</p>
              </div>
              : notifications.map((noti) => (
                <div
                  key={noti._id}
                  className={`group p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${!noti.isRead ? "bg-blue-500/10" : ""
                    }`}
                  onClick={() => {
                    if (!noti.isRead) markAsRead(noti._id);
                  }}
                >
                  {/* Icon */}
                  {(() => {
                    const meta = TYPE_META[noti.type];
                    const Icon = meta?.icon ?? FiBell;
                    const iconColor = meta?.color ?? "text-white/80";
                    return (
                      <span className={`text-lg shrink-0 mt-0.5 ${iconColor}`}>
                        <Icon />
                      </span>
                    );
                  })()}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${!noti.isRead ?
                          "text-white font-medium"
                          : "text-white/70"
                        }`}
                    >
                      {noti.message}
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">
                      {toRelativeTime(noti.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!noti.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(noti._id);
                        }}
                        className="p-1 rounded hover:bg-white/10"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(noti._id);
                      }}
                      className="p-1 rounded hover:bg-white/10"
                      title="Xoá"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400/60" />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
