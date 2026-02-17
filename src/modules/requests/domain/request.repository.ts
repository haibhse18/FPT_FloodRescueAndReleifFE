/**
 * Request Repository Interface - Domain layer
 * Định nghĩa contract cho request operations, không phụ thuộc implementation
 */

import {
  RescueRequest,
  CreateRescueRequestData,
  EmergencyRequestData,
  GetRequestsFilter,
  PaginatedRequests,
} from "./request.entity";

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

  /**
   * Lấy chi tiết yêu cầu
   */
  getRequestDetail(requestId: string): Promise<RescueRequest>;

  /**
   * Xác nhận an toàn / đã nhận
   */
  confirmRequest(requestId: string): Promise<void>;

  /**
   * Lấy tất cả requests với filters (Coordinator)
   */
  getAllRequests(filters?: GetRequestsFilter): Promise<PaginatedRequests>;

  /**
   * Update status của request (Coordinator)
   */
  updateRequestStatus(requestId: string, status: string): Promise<void>;

  /**
   * Update priority của request (Coordinator)
   */
  updateRequestPriority(requestId: string, priority: string): Promise<void>;
}
