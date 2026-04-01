/**
 * Team Stats API - Infrastructure Layer
 * Handles team statistics and rescue trends data
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export interface TeamStats {
  teamId: string;
  teamName: string;
  teamLeader?: {
    id: string;
    displayName: string;
    userName: string;
  };
  memberCount: number;
  activeMemberCount: number;
  totalMissions: number;
  missionsCompleted: number;
  missionsInProgress: number;
  missionsFailed: number;
  peopleRescued: number;
  successRate: number;
  lastUpdated: string;
}

export interface RescueTrends {
  period: 'week' | 'month' | 'year';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    total: number;
  }>;
}

export interface TeamReport {
  stats: TeamStats;
  trends: RescueTrends;
}

export const teamStatsApi = {
  /**
   * GET /teams/:teamId/stats
   * Get comprehensive team statistics
   */
  getTeamStats: async (teamId: string): Promise<ApiResponse<TeamStats>> => {
    return apiClient.get(`/teams/${teamId}/stats`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * GET /teams/:teamId/trends?period=week|month|year
   * Get rescue trends over time
   */
  getRescueTrends: async (
    teamId: string, 
    period: 'week' | 'month' | 'year' = 'week'
  ): Promise<ApiResponse<RescueTrends>> => {
    const params = new URLSearchParams({ period });
    return apiClient.get(`/teams/${teamId}/trends?${params.toString()}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * GET /teams/:teamId/report?period=week|month|year
   * Get comprehensive team report (stats + trends)
   */
  getTeamReport: async (
    teamId: string,
    period: 'week' | 'month' | 'year' = 'week'
  ): Promise<ApiResponse<TeamReport>> => {
    const params = new URLSearchParams({ period });
    return apiClient.get(`/teams/${teamId}/report?${params.toString()}`, {
      headers: authSession.getAuthHeaders(),
    });
  },
};
