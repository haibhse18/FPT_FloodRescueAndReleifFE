"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";

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
    return (
        <AuthGuard allowedRoles={["Citizen"]}>
            {children}
        </AuthGuard>
    );
}
