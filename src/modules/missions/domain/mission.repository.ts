/**
 * Mission Repository Interface - Domain layer
 * Định nghĩa contract cho mission operations, không phụ thuộc implementation
 */

import { 
    CoordinatorRequest, 
    RescueTeam, 
    GetAllRequestsFilter,
    PriorityLevel 
} from './mission.entity';

export interface IMissionRepository {
    /**
     * Lấy tất cả yêu cầu cứu trợ
     */
    getAllRequests(filters?: GetAllRequestsFilter): Promise<CoordinatorRequest[]>;

    /**
     * Phân công đội cứu hộ cho yêu cầu
     */
    assignRescueTeam(requestId: string, teamId: string): Promise<void>;

    /**
     * Lấy danh sách đội cứu hộ
     */
    getRescueTeams(): Promise<RescueTeam[]>;

    /**
     * Cập nhật độ ưu tiên yêu cầu
     */
    updateRequestPriority(requestId: string, priority: PriorityLevel): Promise<void>;
}
