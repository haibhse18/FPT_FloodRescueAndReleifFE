"use client";

import { useParams } from "next/navigation";
import MissionDetailPage from "@/app/(team)/components/MissionDetailPage";

export default function Page() {
  const params = useParams();
  const id = params?.id as string;

  return <MissionDetailPage timelineId={id} />;
}

