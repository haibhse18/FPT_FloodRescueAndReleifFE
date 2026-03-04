"use client";

import { useParams } from "next/navigation";
import TeamDetailPage from "@/modules/teams/presentation/pages/TeamDetailPage";

export default function Page() {
  const params = useParams();
  const teamId = params?.teamId as string;

  if (!teamId) {
    return (
      <div className="p-8 text-center text-gray-400">Không tìm thấy đội</div>
    );
  }

  return <TeamDetailPage teamId={teamId} isCoordinator={true} />;
}
