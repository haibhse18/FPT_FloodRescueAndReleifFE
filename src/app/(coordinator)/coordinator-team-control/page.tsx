import { Suspense } from "react";
import CoordinatorTeamListPage from "@/modules/teams/presentation/pages/CoordinatorTeamListPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-white flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
        </div>
      }
    >
      <CoordinatorTeamListPage />
    </Suspense>
  );
}
