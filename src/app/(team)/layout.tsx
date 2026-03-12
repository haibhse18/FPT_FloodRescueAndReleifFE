"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { useSocketInit } from "@/hooks/useSocketInit";
import NotificationBell from "@/modules/notifications/presentation/components/NotificationBell";

/**
 * Layout cho Rescue Team routes
 * Chỉ cho phép role "Rescue Team" truy cập
 */
export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Khởi tạo Socket.IO khi authenticated
  useSocketInit();

  return (
    <AuthGuard allowedRoles={["Rescue Team"]}>
      <div className="relative">
        {/* Notification Bell — top-right */}
        <div className="absolute top-4 right-4 z-50">
          <NotificationBell />
        </div>

        {children}
      </div>
    </AuthGuard>
  );
}
