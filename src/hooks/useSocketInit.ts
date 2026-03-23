"use client";

/**
 * useSocketInit — Hook để khởi tạo Socket.IO connection khi user đã đăng nhập.
 *
 * Sử dụng trong layout files để auto-connect/disconnect socket.
 */

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuth.store";
import { useNotificationStore } from "@/store/useNotification.store";

export function useSocketInit() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initSocket = useNotificationStore((s) => s.initSocket);
  const cleanup = useNotificationStore((s) => s.cleanup);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token =
      typeof window !== "undefined" ?
        localStorage.getItem("accessToken")
      : null;
    const userId = user._id || user.id;

    if (!token || !userId) return;

    initSocket(token, userId);

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);
}
