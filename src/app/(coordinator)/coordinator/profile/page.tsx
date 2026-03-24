import { AuthGuard } from "@/shared/components/AuthGuard";
import CoordinatorProfilePage from "@/modules/users/presentation/pages/CoordinatorProfilePage";

export default function CoordinatorProfileRoute() {
  return (
    <AuthGuard allowedRoles={["Rescue Coordinator"]}>
      <CoordinatorProfilePage />
    </AuthGuard>
  );
}
