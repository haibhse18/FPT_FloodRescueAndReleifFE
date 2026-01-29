"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";

/**
 * Layout cho Rescue Team routes
 * Chỉ cho phép role "Rescue Team" truy cập
 */
export default function TeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={["Rescue Team"]}>
            {children}
        </AuthGuard>
    );
}
