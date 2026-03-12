"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import CoordinatorSidebar from "./components/CoordinatorSidebar";
import { MobileBottomNav } from "@/shared/components/layout";
import { Toaster } from "@/shared/ui/components";
import { useSocketInit } from "@/hooks/useSocketInit";
import NotificationBell from "@/modules/notifications/presentation/components/NotificationBell";

/**
 * Layout cho Coordinator routes
 * Chỉ cho phép role "Rescue Coordinator" truy cập
 */
export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Khởi tạo Socket.IO khi authenticated
  useSocketInit();

  return (
    <AuthGuard allowedRoles={["Rescue Coordinator"]}>
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
        <CoordinatorSidebar />
        <div className="flex-1 flex flex-col lg:ml-64 relative">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Notification Bell — top-right */}
          <div className="absolute top-4 right-4 z-50">
            <NotificationBell />
          </div>

          {children}
          <Toaster />
          <MobileBottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
