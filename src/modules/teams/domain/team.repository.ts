/**
 * Team Repository Interface - Domain layer
 * Định nghĩa contract cho team operations, không phụ thuộc implementation
 */

import { 
    AssignedRequest, 
    UpdateRequestStatusData,
    LocationData 
} from './team.entity';

export interface ITeamRepository {
    /**
     * Lấy danh sách yêu cầu được phân công
     */
    getAssignedRequests(): Promise<AssignedRequest[]>;

    /**
     * Cập nhật trạng thái yêu cầu
     */
    updateRequestStatus(requestId: string, data: UpdateRequestStatusData): Promise<void>;

    /**
     * Cập nhật vị trí đội
     */
    updateLocation(location: LocationData): Promise<void>;

    /**
     * Báo cáo tiến độ nhiệm vụ
     */
    reportProgress(requestId: string, progress: string): Promise<void>;
}
