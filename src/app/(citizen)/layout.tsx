"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import CitizenSidebar from "./components/CitizenSidebar";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { Toaster } from "@/shared/ui/components/toaster";
import { useSocketInit } from "@/hooks/useSocketInit";
import { useNotificationStore } from "@/store/useNotification.store";
import { usePathname } from "next/navigation";

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
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
<<<<<<< HEAD
        <CitizenSidebar />
        <div className="flex-1 flex flex-col lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 relative">
=======
        {!isRequestPage && <CitizenSidebar />}
        <div className={`flex-1 flex flex-col relative ${isRequestPage ? "" : "lg:ml-64"}`}>
>>>>>>> ee959ef043edcce473029bb01051e0d15b834017
          {/* Background Pattern - Global for Citizen pages */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none z-0"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

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
