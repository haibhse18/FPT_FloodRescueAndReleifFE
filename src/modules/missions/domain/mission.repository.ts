/**
 * Mission Repository Interface - Domain layer
 * Định nghĩa contract cho mission operations, không phụ thuộc implementation
 */

import {
  CoordinatorRequest,
  RescueTeam,
  GetAllRequestsFilter,
  PriorityLevel,
} from "./mission.entity";

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
  updateRequestPriority(
    requestId: string,
    priority: PriorityLevel,
  ): Promise<void>;
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
  getMissionPositions(missionId: string): Promise<any[]>;

  /**
   * Lấy tất cả missions
   */
  getAllMissions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]>;
}
