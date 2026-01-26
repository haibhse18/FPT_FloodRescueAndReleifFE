/**
 * Team Repository Implementation - Infrastructure layer
 * Implement ITeamRepository interface using teamsApi
 */

import { ITeamRepository } from '../domain/team.repository';
import { 
    AssignedRequest, 
    UpdateRequestStatusData,
    LocationData 
} from '../domain/team.entity';
import { teamsApi } from './team.api';

export class TeamRepositoryImpl implements ITeamRepository {
    async getAssignedRequests(): Promise<AssignedRequest[]> {
        const response = await teamsApi.getAssignedRequests();
        return (response as any).data || [];
    }

    async updateRequestStatus(requestId: string, data: UpdateRequestStatusData): Promise<void> {
        await teamsApi.updateRequestStatus(requestId, data);
    }

    async updateLocation(location: LocationData): Promise<void> {
        await teamsApi.updateLocation(location);
    }

    async reportProgress(requestId: string, progress: string): Promise<void> {
        await teamsApi.reportProgress(requestId, progress);
    }
}

// Singleton instance for easy access
export const teamRepository = new TeamRepositoryImpl();
