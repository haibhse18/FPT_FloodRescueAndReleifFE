"use client";

import { useState, useEffect } from "react";
import TeamMyTeamPage from "@/modules/teams/presentation/pages/TeamMyTeamPage";
import { useAuthStore } from "@/store/useAuth.store";

export default function MyTeamPage() {
  const { user, getCurrentUser, isAuthenticated } = useAuthStore();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveTeam = async () => {
      setLoading(true);

      const extractTeamId = (
        value: unknown,
      ): string | null => {
        if (!value) return null;
        if (typeof value === "string") return value;
        return (value as { _id?: string })._id ?? null;
      };

      let resolvedTeamId = extractTeamId(user?.teamId);

      // Sau login, payload user có thể chưa đầy đủ teamId; fetch lại /auth/me một lần.
      if (!resolvedTeamId && isAuthenticated) {
        await getCurrentUser();
        const freshUser = useAuthStore.getState().user;
        resolvedTeamId = extractTeamId(freshUser?.teamId);
      }

      if (!cancelled) {
        setTeamId(resolvedTeamId);
        setLoading(false);
      }
    };

    resolveTeam();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated, getCurrentUser]);

  if (loading) {
    return (
      <div className="relative z-10 p-8 pb-24 lg:pb-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF7700]"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="relative z-10 p-8 pb-24 lg:pb-8 text-center">
        <div className="text-6xl mb-4">🫥</div>
        <p className="text-gray-300 text-lg">Bạn chưa thuộc đội nào</p>
        <p className="text-gray-400 text-sm mt-2">
          Liên hệ Coordinator để được thêm vào đội cứu hộ
        </p>
      </div>
    );
  }

  return <TeamMyTeamPage teamId={teamId} />;
}
