import { ICoordinatorRepository } from "../domain/coordinator.repository";
import {
    CoordinatorRequest,
    Mission,
    TeamPosition,
    RequestFilters,
    PaginatedRequests,
} from "../domain/request.entity";
import { coordinatorApi } from "./coordinator.api";

/**
 * Coordinator Repository Implementation
 * Infrastructure layer: Gọi API thực tế
 */
export class CoordinatorRepositoryImpl implements ICoordinatorRepository {
    async getAllRequests(filters?: RequestFilters): Promise<PaginatedRequests> {
        const response = await coordinatorApi.getAllRequests(filters);
        return response as any;
    }

    async getRequestDetail(requestId: string): Promise<CoordinatorRequest> {
        const response = await coordinatorApi.getRequestDetail(requestId);
        return (response as any).data;
    }

    async updateRequestStatus(requestId: string, status: string): Promise<void> {
        await coordinatorApi.updateRequestStatus(requestId, status);
    }

    async updateRequestPriority(
        requestId: string,
        priority: string
    ): Promise<void> {
        await coordinatorApi.updateRequestPriority(requestId, priority);
    }

    async createMission(data: {
        teamId: string;
        requestIds: string[];
        vehicleId?: string;
    }): Promise<string> {
        const response = await coordinatorApi.createMission(data);
        return (response as any).missionId;
    }

    async reassignMission(missionId: string, teamId: string): Promise<void> {
        await coordinatorApi.reassignMission(missionId, teamId);
    }

    async getMissionPositions(missionId: string): Promise<TeamPosition[]> {
        const response = await coordinatorApi.getMissionPositions(missionId);
        return (response as any).data || response;
    }

    async getAllMissions(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<Mission[]> {
        const response = await coordinatorApi.getAllMissions(params);
        return (response as any).data || response;
    }
}

// Export singleton instance
export const coordinatorRepository = new CoordinatorRepositoryImpl();
