"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import TeamSidebar from "./components/TeamSidebar";
import { MobileBottomNav } from "@/shared/components/layout";
import { Toaster } from "@/shared/ui/components";
import { useSocketInit } from "@/hooks/useSocketInit";
import NotificationBell from "@/modules/notifications/presentation/components/NotificationBell";

const TEAM_BOTTOM_NAV = [
  { icon: "📋", label: "Nhiệm vụ", href: "/missions" },
  { icon: "👥", label: "Đội", href: "/my-team" },
  { icon: "🔔", label: "Thông báo", href: "/notifications" },
  { icon: "👤", label: "Tôi", href: "/profile" },
];

/**
 * Layout cho Rescue Team routes - đồng bộ với Coordinator (sidebar, bg, pattern)
 * Chỉ cho phép role "Rescue Team" truy cập
 */
export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSocketInit();

  return (
    <AuthGuard allowedRoles={["Rescue Team"]}>
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
        <TeamSidebar />
        <div className="flex-1 flex flex-col lg:ml-64 relative">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute top-4 right-4 z-50">
            <NotificationBell />
          </div>
          {children}
          <Toaster />
          <MobileBottomNav items={TEAM_BOTTOM_NAV} />
        </div>
      </div>
    </AuthGuard>
  );
}
