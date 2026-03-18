"use client";

import { useParams } from "next/navigation";
import TeamTimelineDetailPage from "@/modules/teams/presentation/pages/TeamTimelineDetailPage";

export default function Page() {
  const params = useParams();
  const id = params?.id as string;

  return <TeamTimelineDetailPage timelineId={id} />;
}

