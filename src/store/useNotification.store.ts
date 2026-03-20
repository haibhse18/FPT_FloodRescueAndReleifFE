"use client";

/**
 * Notification Store - Zustand
 *
 * Quản lý state thông báo real-time qua Socket.IO + REST API.
 * Thay thế React Context pattern trong Noti-guide.md.
 *
 * Cách dùng:
 *   const { notifications, unreadCount, isConnected, markAsRead } = useNotificationStore();
 *
 * Khởi tạo socket:
 *   useEffect(() => { initSocket(token, userId); return () => cleanup(); }, [token, userId]);
 */

import { create } from "zustand";
import { toast } from "sonner";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/lib/socket-events";
import { notificationRepository } from "@/modules/notifications/infrastructure/notification.repository.impl";
import type { Notification } from "@/modules/notifications/domain/notification.entity";

// ─── Types ─────────────────────────────────────────────────

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  totalPages: number;
  currentPage: number;

  // Actions
  initSocket: (token: string, userId: string) => void;
  cleanup: () => void;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAll: (userId: string) => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────

let socketRef: Socket | null = null;

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  totalPages: 1,
  currentPage: 1,

  /**
   * Khởi tạo Socket.IO connection + đăng ký event listeners
   */
  initSocket: (token: string, userId: string) => {
    // Tránh khởi tạo lại nếu đã connected
    if (socketRef?.connected) return;

    const socket = connectSocket(token);
    socketRef = socket;

    // ─── Connection events ──────────────────────────────
    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      set({ isConnected: true });
      // Re-fetch để bắt kịp notifications miss khi offline
      get().fetchNotifications();
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      set({ isConnected: false });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      set({ isConnected: false });
    });

    // Server confirmation
    socket.on("CONNECTED", (data) => {
      console.log("✅ Server confirmed:", data);
      get().fetchNotifications();
    });

    // ─── Notification event handler ─────────────────────
    const handleNewNotification = (data: Notification) => {
      // Create a fallback date if needed
      let dateObj = new Date();
      if (data.createdAt) {
        dateObj = new Date(data.createdAt);
      } else if (data.timestamp) {
        dateObj = new Date(data.timestamp);
      }

      // Ensure date is valid, else fallback to current time
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      // Ensure that coming from socket, it is always marked as unread
      const safeData = {
        ...data,
        isRead: false,
        createdAt: dateObj.toISOString(),
      };

      // ─── Deduplication: Check for duplicate notifications ────
      // Skip if same type + mission/request + message within last 3 seconds
      const isDuplicate = get().notifications.some((existing) => {
        const existingTime = new Date(existing.createdAt).getTime();
        const newTime = dateObj.getTime();
        const timeDiff = Math.abs(newTime - existingTime);

        return (
          existing.type === safeData.type &&
          existing.missionId === safeData.missionId &&
          existing.requestId === safeData.requestId &&
          existing.message === safeData.message &&
          timeDiff <= 3000 // Within 3 seconds
        );
      });

      if (isDuplicate) {
        console.log("🔄 Thông báo trùng lặp bị bỏ qua:", safeData.message);
        return;
      }

      set((state) => ({
        notifications: [safeData, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      // Show toast
      toast(safeData.message || "Có thông báo mới", {
        description: dateObj.toLocaleString("vi-VN"),
      });
    };

    // Unread count update from server
    const handleUnreadCount = (data: { unreadCount: number }) => {
      set({ unreadCount: data.unreadCount });
    };

    // ─── Register all event listeners ───────────────────
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);
    socket.on(SOCKET_EVENTS.REQUEST_SUBMITTED, handleNewNotification);
    socket.on(SOCKET_EVENTS.REQUEST_VERIFIED, handleNewNotification);
    socket.on(SOCKET_EVENTS.REQUEST_REJECTED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_ASSIGNED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_ACCEPTED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_APPROACHING, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_COMPLETED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_FAILED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_REASSIGNED, handleNewNotification);
    socket.on(SOCKET_EVENTS.MISSION_WITHDRAWN, handleNewNotification);
    socket.on(SOCKET_EVENTS.UNREAD_COUNT_UPDATE, handleUnreadCount);
  },

  /**
   * Ngắt kết nối Socket + xóa listeners
   */
  cleanup: () => {
    if (socketRef) {
      socketRef.removeAllListeners();
      disconnectSocket();
      socketRef = null;
    }
    set({ isConnected: false });
  },

  /**
   * Fetch notifications qua REST API
   */
  fetchNotifications: async (page = 1, limit = 10) => {
    try {
      const result = await notificationRepository.getNotifications(page, limit);
      set({
        notifications: result.data,
        unreadCount: result.data.filter((n) => !n.isRead).length,
        totalPages: result.meta?.pages || 1,
        currentPage: result.meta?.page || 1,
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  },

  /**
   * Mark as read — optimistic update
   */
  markAsRead: async (notificationId: string) => {
    // Optimistic
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationRepository.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Revert on failure: re-fetch
      get().fetchNotifications();
    }
  },

  /**
   * Delete single notification — optimistic update
   */
  deleteNotification: async (notificationId: string) => {
    const prev = get().notifications;
    const target = prev.find((n) => n._id === notificationId);

    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n._id !== notificationId,
      ),
      unreadCount:
        target && !target.isRead ?
          Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));

    try {
      await notificationRepository.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      set({ notifications: prev });
    }
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (userId: string) => {
    const prev = get().notifications;

    set({ notifications: [], unreadCount: 0 });

    try {
      await notificationRepository.deleteAll(userId);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      set({ notifications: prev });
    }
  },
}));
