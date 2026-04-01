"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import CitizenSidebar from "./components/CitizenSidebar";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { Toaster } from "@/shared/ui/components/toaster";
import { useSocketInit } from "@/hooks/useSocketInit";
import { useNotificationStore } from "@/store/useNotification.store";
import { usePathname } from "next/navigation";

const CITIZEN_BACKGROUND_URL = "/images/flood-rescue2.jpg";

/**
 * Layout cho Citizen routes
 * Bọc tất cả các trang trong (citizen) group với AuthGuard
 * Chỉ cho phép role "Citizen" truy cập
 */
export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Khởi tạo Socket.IO khi authenticated
  useSocketInit();

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isRequestPage = pathname === "/request";

  return (
    <AuthGuard allowedRoles={["Citizen"]}>
      <div
        className="fixed inset-0 bg-center bg-cover bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: `url(${CITIZEN_BACKGROUND_URL})`,
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-[#0b2233]/80 pointer-events-none z-0" aria-hidden="true" />
      <div
        className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,119,0,0.14),transparent_45%)] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 flex flex-col lg:flex-row ${isRequestPage ? "h-screen overflow-hidden" : "min-h-screen"}`}
      >
        <CitizenSidebar />
        <div
          className={`flex-1 flex flex-col lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 relative ${isRequestPage ? "min-h-0 overflow-hidden" : ""}`}
        >
          {children}
          <Toaster />

          {!isRequestPage && (
            <MobileBottomNav
              badges={unreadCount > 0 ? { "/notifications": unreadCount } : {}}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}