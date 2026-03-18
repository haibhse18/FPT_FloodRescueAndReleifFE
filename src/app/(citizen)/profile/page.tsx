import { AuthGuard } from "@/shared/components/AuthGuard";
import CitizenProfilePage from "@/modules/users/presentation/pages/CitizenProfilePage";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <CitizenProfilePage />
    </AuthGuard>
  );
}
