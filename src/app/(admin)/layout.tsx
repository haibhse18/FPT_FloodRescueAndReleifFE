"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { MobileBottomNav } from "@/shared/components/layout";
import { Toaster } from "@/shared/ui/components";
import AdminSidebar from "./components/AdminSidebar";

/**
 * Layout cho Admin routes
 * Chỉ cho phép role "Admin" truy cập
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["Admin"]}>
     <div className="h-screen bg-[#133249] flex flex-col lg:flex-row overflow-hidden">
  <AdminSidebar />

  <div className="flex-1 flex flex-col lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 relative overflow-hidden">

    {/* Background */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />

    {/* Content scroll */}
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>

    <Toaster />
    <MobileBottomNav />
  </div>
</div>
    </AuthGuard>
  );
}
