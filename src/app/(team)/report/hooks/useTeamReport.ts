"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuth.store";
import { teamStatsApi, type TeamStats, type RescueTrends } from "@/modules/teams/infrastructure/team.stats.api";

export interface UseTeamReportReturn {
  stats: TeamStats | null;
  trends: RescueTrends | null;
  loading: boolean;
  error: string | null;
  period: 'week' | 'month' | 'year';
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  refetch: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshTrends: () => Promise<void>;
}

export function useTeamReport(): UseTeamReportReturn {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [trends, setTrends] = useState<RescueTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriodState] = useState<'week' | 'month' | 'year'>('week');

  const { user, getCurrentUser, isAuthenticated } = useAuthStore();

  const resolveTeamId = useCallback((value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return (value as { _id?: string })._id ?? null;
  }, []);

  const getResolvedTeamId = useCallback(async () => {
    let teamId = resolveTeamId(user?.teamId);

    if (!teamId && isAuthenticated) {
      await getCurrentUser();
      teamId = resolveTeamId(useAuthStore.getState().user?.teamId);
    }

    return teamId;
  }, [getCurrentUser, isAuthenticated, resolveTeamId, user?.teamId]);

  // Fetch team statistics
  const fetchStats = useCallback(async () => {
    const teamId = await getResolvedTeamId();

    if (!teamId) {
      setError("Bạn chưa thuộc đội nào");
      return;
    }

    try {
      const response = await teamStatsApi.getTeamStats(teamId);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.message || "Không thể tải thống kê đội");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      console.error("Error fetching team stats:", err);
    }
  }, [getResolvedTeamId]);

  // Fetch rescue trends
  const fetchTrends = useCallback(async (selectedPeriod: 'week' | 'month' | 'year' = period) => {
    const teamId = await getResolvedTeamId();

    if (!teamId) {
      setError("Bạn chưa thuộc đội nào");
      return;
    }

    try {
      const response = await teamStatsApi.getRescueTrends(teamId, selectedPeriod);
      
      if (response.success && response.data) {
        setTrends(response.data);
      } else {
        throw new Error(response.message || "Không thể tải xu hướng cứu hộ");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      console.error("Error fetching rescue trends:", err);
    }
  }, [getResolvedTeamId, period]);

  // Fetch both stats and trends
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchTrends(period)
      ]);
    } catch (err) {
      // Error is already handled in individual fetch functions
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchTrends, period]);

  // Refetch both stats and trends
  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Refresh only stats
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Refresh only trends
  const refreshTrends = useCallback(async () => {
    await fetchTrends(period);
  }, [fetchTrends, period]);

  // Set period and fetch new trends
  const setPeriod = useCallback((newPeriod: 'week' | 'month' | 'year') => {
    setPeriodState(newPeriod);
    // Trends will be refetched in useEffect
  }, []);

  // Initial fetch and period change effect
  useEffect(() => {
    if (resolveTeamId(user?.teamId)) {
      fetchTrends(period);
    }
  }, [period, user?.teamId, fetchTrends, resolveTeamId]);

  // Initial data fetch
  useEffect(() => {
    if (resolveTeamId(user?.teamId) || isAuthenticated) {
      fetchAll();
    } else {
      setLoading(false);
      setError("Bạn chưa thuộc đội nào");
    }
  }, [user?.teamId, isAuthenticated, fetchAll, resolveTeamId]);

  return {
    stats,
    trends,
    loading,
    error,
    period,
    setPeriod,
    refetch,
    refreshStats,
    refreshTrends,
  };
}
