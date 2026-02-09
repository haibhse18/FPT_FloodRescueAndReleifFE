"use client";

import CitizenHomePage from "@/modules/citizen/presentation/pages/CitizenHomePage";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function Page() {
    return (
        <AuthGuard allowedRoles={["Citizen"]}>
            <CitizenHomePage />
        </AuthGuard>
    );
}
