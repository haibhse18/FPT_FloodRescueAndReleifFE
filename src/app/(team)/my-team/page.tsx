"use client";

import { useState, useEffect } from "react";
import TeamDetailPage from "@/modules/teams/presentation/pages/TeamDetailPage";
import { useAuthStore } from "@/store/useAuth.store";

export default function MyTeamPage() {
  const { user } = useAuthStore();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.teamId) {
      setTeamId(user.teamId);
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🫥</div>
        <p className="text-gray-300 text-lg">Bạn chưa thuộc đội nào</p>
        <p className="text-gray-400 text-sm mt-2">
          Liên hệ Coordinator để được thêm vào đội cứu hộ
        </p>
      </div>
    );
  }

  return <TeamDetailPage teamId={teamId} isCoordinator={false} />;
}
