import { Suspense } from "react";
import CoordinatorRequestsPage from "@/modules/requests/presentation/pages/CoordinatorRequestsPage";

export default function Page() {
  // Requests page now shows the dashboard with full request management
  return (
    <Suspense
      fallback={
        <div className="p-8 text-white flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
        </div>
      }
    >
      <CoordinatorRequestsPage />
    </Suspense>
  );
}
