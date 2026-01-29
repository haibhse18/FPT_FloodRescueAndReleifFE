"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";

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
            {children}
        </AuthGuard>
    );
}
