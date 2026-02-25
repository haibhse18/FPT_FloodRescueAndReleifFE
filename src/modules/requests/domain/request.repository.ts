/**
 * Request Repository Interface - Domain layer
 * Định nghĩa contract cho request operations
 */

import {
  RescueRequest,
  CreateRescueRequestData,
  EmergencyRequestData,
  GetRequestsFilter,
  PaginatedRequests,
  CoordinatorRequest,
  VerifyRequestInput,
  MarkDuplicateInput,
  UpdateLocationInput,
  UpdatePriorityInput,
  CancelRequestInput,
  CreateOnBehalfInput,
  CitizenSearchResult,
} from "./request.entity";

export interface IRequestRepository {
  // ─── Citizen Operations ──────────────────────────────────
  createRescueRequest(data: CreateRescueRequestData): Promise<RescueRequest>;
  createEmergencyRequest(data: EmergencyRequestData): Promise<RescueRequest>;
  getMyRequests(filters?: GetRequestsFilter): Promise<RescueRequest[]>;
  getHistory(): Promise<RescueRequest[]>;
  getRequestDetail(requestId: string): Promise<CoordinatorRequest>;
  confirmRequest(requestId: string): Promise<void>;

  // ─── Coordinator Operations ──────────────────────────────
  getAllRequests(filters?: GetRequestsFilter): Promise<PaginatedRequests>;
  verifyRequest(
    requestId: string,
    input: VerifyRequestInput,
  ): Promise<CoordinatorRequest>;
  closeRequest(requestId: string): Promise<CoordinatorRequest>;
  markDuplicate(
    requestId: string,
    input: MarkDuplicateInput,
  ): Promise<CoordinatorRequest>;
  updateLocation(
    requestId: string,
    input: UpdateLocationInput,
  ): Promise<CoordinatorRequest>;
  updateRequestPriority(
    requestId: string,
    input: UpdatePriorityInput,
  ): Promise<CoordinatorRequest>;
  cancelRequest(
    requestId: string,
    input?: CancelRequestInput,
  ): Promise<CoordinatorRequest>;
  createOnBehalf(input: CreateOnBehalfInput): Promise<CoordinatorRequest>;
  searchCitizens(query: string): Promise<CitizenSearchResult[]>;

  /** @deprecated Use verifyRequest instead */
  updateRequestStatus(requestId: string, status: string): Promise<void>;
}
