import RequestDetailPage from "@/modules/missions/presentation/pages/RequestDetailPage";

export default function Page({ params }: { params: { id: string } }) {
    return <RequestDetailPage requestId={params.id} />;
}
