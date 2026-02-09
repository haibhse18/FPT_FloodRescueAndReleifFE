"use client";

import CitizenHistoryPage from "@/modules/citizen/presentation/pages/CitizenHistoryPage";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function Page() {
    return (
        <AuthGuard allowedRoles={["Citizen"]}>
            <CitizenHistoryPage />
        </AuthGuard>
    );
}
