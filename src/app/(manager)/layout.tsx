"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import ManagerSidebar from "./components/ManagerSidebar";
import { MobileBottomNav } from "@/shared/components/layout";
import { Toaster } from "@/shared/ui/components";

/**
 * Layout cho Manager routes
 * Chỉ cho phép role "Manager" truy cập
 */
export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["Manager"]}>
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#F3F4F4] text-black-800">
        {/* Sidebar */}
        <ManagerSidebar />
        <div className="flex-1 flex flex-col lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 relative">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(30,58,138,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Content */}
          <div className="flex-1 p-6">
            {children}
          </div>

          {/* Mobile Bottom Nav */}
          <MobileBottomNav />

          {/* Toast Notifications */}
          {/* <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1E3A8A",
                color: "white",
                border: "1px solid #EF4444", // accent đỏ
              },
            }}
          /> */}
        </div>
      </div>
    </AuthGuard>
  );
}