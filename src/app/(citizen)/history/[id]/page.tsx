import CitizenRequestDetailPage from "@/modules/citizen/presentation/pages/CitizenRequestDetailPage";

interface Props {
    params: { id: string };
}

export default function Page({ params }: Props) {
    return <CitizenRequestDetailPage id={params.id} />;
}
