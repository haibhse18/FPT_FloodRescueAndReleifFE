/**
 * Mission Repository Implementation - Infrastructure layer
 * Implement IMissionRepository interface using coordinatorApi
 */

import { IMissionRepository } from '../domain/mission.repository';
import { 
    CoordinatorRequest, 
    RescueTeam, 
    GetAllRequestsFilter,
    PriorityLevel 
} from '../domain/mission.entity';
import { coordinatorApi } from './coordinator.api';

export class MissionRepositoryImpl implements IMissionRepository {
    async getAllRequests(filters?: GetAllRequestsFilter): Promise<CoordinatorRequest[]> {
        const response = await coordinatorApi.getAllRequests(filters);
        return (response as any).data || [];
    }

    async assignRescueTeam(requestId: string, teamId: string): Promise<void> {
        await coordinatorApi.assignRescueTeam(requestId, teamId);
    }

    async getRescueTeams(): Promise<RescueTeam[]> {
        const response = await coordinatorApi.getRescueTeams();
        return (response as any).data || [];
    }

    async updateRequestPriority(requestId: string, priority: PriorityLevel): Promise<void> {
        await coordinatorApi.updateRequestPriority(requestId, priority);
    }
}

// Singleton instance for easy access
export const missionRepository = new MissionRepositoryImpl();
