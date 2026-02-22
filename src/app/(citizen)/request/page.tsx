import { Suspense } from "react";
import CitizenRequestPage from "@/modules/requests/presentation/pages/CitizenRequestPage";

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <CitizenRequestPage />
        </Suspense>
    );
}
