/**
 * MissionRequest Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu MissionRequest theo Unified v2.2
 */

// ─── Enums ───────────────────────────────────────────────

export type MissionRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PARTIAL"
  | "FULFILLED"
  | "CLOSED"
  | "DROPPED";

// ─── Main Entity ─────────────────────────────────────────

export interface MissionRequest {
  _id: string;
  missionId: string;
  requestId: string;
  status: MissionRequestStatus;
  
  // Thông tin Snapshot từ Request gốc để dễ track quá trình
  requestPeopleSnapshot?: number;
  prioritySnapshot?: string;
  
  // Tiến độ thực hiện
  peopleRescued: number;
  fulfillmentPercent: number;
  
  note?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields (optional, depend on API response)
  requestDetails?: any; // Có thể liên kết với Request entity sau
}

// ─── Input DTOs ──────────────────────────────────────────

export interface AddRequestsToMissionInput {
  requestIds: string[];
  note?: string;
}

export interface RemoveRequestFromMissionInput {
  note?: string;
}

export interface CloseMissionRequestInput {
  note?: string;
}

export interface DropMissionRequestInput {
  note?: string;
}
