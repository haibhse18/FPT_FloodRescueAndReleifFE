import CoordinatorRequestDetailPage from "@/modules/coordinator/presentation/pages/CoordinatorRequestDetailPage";

export default function Page({ params }: { params: { id: string } }) {
    return <CoordinatorRequestDetailPage params={params} />;
}
