import {
    CoordinatorRequest,
    Mission,
    TeamPosition,
    RequestFilters,
    PaginatedRequests,
} from "./request.entity";

/**
 * Coordinator Repository Interface
 * Clean Architecture: Domain layer không phụ thuộc vào implementation
 */
export interface ICoordinatorRepository {
    /**
     * Lấy tất cả requests với filters
     */
    getAllRequests(filters?: RequestFilters): Promise<PaginatedRequests>;

    /**
     * Lấy chi tiết 1 request
     */
    getRequestDetail(requestId: string): Promise<CoordinatorRequest>;

    /**
     * Update status của request
     */
    updateRequestStatus(requestId: string, status: string): Promise<void>;

    /**
     * Update priority của request
     */
    updateRequestPriority(requestId: string, priority: string): Promise<void>;

    /**
     * Tạo mission mới (assign team)
     */
    createMission(data: {
        teamId: string;
        requestIds: string[];
        vehicleId?: string;
    }): Promise<string>; // return missionId

    /**
     * Reassign mission
     */
    reassignMission(missionId: string, teamId: string): Promise<void>;

    /**
     * Lấy positions của team
     */
    getMissionPositions(missionId: string): Promise<TeamPosition[]>;

    /**
     * Lấy tất cả missions
     */
    getAllMissions(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<Mission[]>;
}
