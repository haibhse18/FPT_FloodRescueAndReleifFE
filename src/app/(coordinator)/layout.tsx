"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";

/**
 * Layout cho Coordinator routes
 * Chỉ cho phép role "Rescue Coordinator" truy cập
 */
export default function CoordinatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={["Rescue Coordinator"]}>
            {children}
        </AuthGuard>
    );
}
