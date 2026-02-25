"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGuard } from "@/shared/components/AuthGuard";
import CitizenSidebar from "./components/CitizenSidebar";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { notificationsApi } from "@/modules/notifications/infrastructure/notifications.api";
import { Toaster } from "@/components/ui/toaster";

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

  const refreshUnreadCount = useCallback(() => {
    // Swagger only has GET /notifications — derive unread count from list
    notificationsApi
      .getNotifications()
      .then((res: any) => {
        const list: any[] = Array.isArray(res) ? res : res?.data ?? [];
        const count = list.filter((n: any) => !(n.isRead ?? n.is_read)).length;
        setUnreadCount(count);
      })
      .catch(() => {
        // silently ignore — badge is non-critical
      });
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    // Re-check every 60 s while the user is on a citizen page
    const interval = setInterval(refreshUnreadCount, 60_000);
    // Listen for immediate refresh triggered by notifications page (mark as read)
    window.addEventListener("notifications:updated", refreshUnreadCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications:updated", refreshUnreadCount);
    };
  }, [refreshUnreadCount]);

  return (
    <AuthGuard allowedRoles={["Citizen"]}>
      <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
        <CitizenSidebar unreadCount={unreadCount} />
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
          <Toaster />

          <MobileBottomNav
            badges={unreadCount > 0 ? { "/notifications": unreadCount } : {}}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
