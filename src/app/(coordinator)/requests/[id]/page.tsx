import CoordinatorRequestDetailPage from "@/modules/requests/presentation/pages/CoordinatorRequestDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return <CoordinatorRequestDetailPage params={params} />;
}
