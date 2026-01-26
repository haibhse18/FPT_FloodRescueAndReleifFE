/**
 * Request Repository Interface - Domain layer
 * Định nghĩa contract cho request operations, không phụ thuộc implementation
 */

import { 
    RescueRequest, 
    CreateRescueRequestData, 
    EmergencyRequestData,
    GetRequestsFilter 
} from './request.entity';

export interface IRequestRepository {
    /**
     * Tạo yêu cầu cứu hộ mới
     */
    createRescueRequest(data: CreateRescueRequestData): Promise<RescueRequest>;

    /**
     * Tạo yêu cầu khẩn cấp
     */
    createEmergencyRequest(data: EmergencyRequestData): Promise<RescueRequest>;

    /**
     * Lấy danh sách yêu cầu của user
     */
    getMyRequests(filters?: GetRequestsFilter): Promise<RescueRequest[]>;

    /**
     * Lấy lịch sử yêu cầu
     */
    getHistory(): Promise<RescueRequest[]>;
}
