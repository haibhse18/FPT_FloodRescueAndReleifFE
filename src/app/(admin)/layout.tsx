"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";

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
            {children}
        </AuthGuard>
    );
}
