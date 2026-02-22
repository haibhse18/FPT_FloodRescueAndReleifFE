"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/shared/components/AuthGuard";
import CitizenSidebar from "./components/CitizenSidebar";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { notificationsApi } from "@/modules/notifications/infrastructure/notifications.api";

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi
      .getUnreadCount()
      .then((res: any) => {
        const count =
          res?.data?.count ?? res?.data?.unreadCount ?? res?.count ?? 0;
        setUnreadCount(Number(count) || 0);
      })
      .catch(() => {
        // silently ignore — badge is non-critical
      });
  }, []);

  return (
    <AuthGuard allowedRoles={["Citizen"]}>
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
        <CitizenSidebar />
        <div className="flex-1 flex flex-col lg:ml-64 relative">
          {/* Background Pattern - Global for Citizen pages */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none z-0"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {children}

          <MobileBottomNav
            badges={unreadCount > 0 ? { "/notifications": unreadCount } : {}}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
