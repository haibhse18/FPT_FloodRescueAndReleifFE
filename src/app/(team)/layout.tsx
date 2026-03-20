"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { useSocketInit } from "@/hooks/useSocketInit";
import NotificationBell from "@/modules/notifications/presentation/components/NotificationBell";
import TeamSidebar, { TEAM_MOBILE_NAV_ITEMS } from "./components/TeamSidebar";
import { MobileBottomNav } from "@/shared/components/layout";
import { Toaster } from "@/shared/ui/components";

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
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
        <TeamSidebar />
        <div className="flex-1 flex flex-col lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 relative">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="absolute top-4 right-4 z-50">
            <NotificationBell />
          </div>

          <main className="relative z-10 pt-14 lg:pt-4">
            {children}
          </main>
          <Toaster />
          <MobileBottomNav items={TEAM_MOBILE_NAV_ITEMS} />
        </div>
      </div>
    </AuthGuard>
  );
}
