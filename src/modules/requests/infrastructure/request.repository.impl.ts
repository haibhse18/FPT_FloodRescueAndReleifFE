/**
 * Request Repository Implementation - Infrastructure layer
 * Implement IRequestRepository interface using requestsApi
 */

import { IRequestRepository } from "../domain/request.repository";
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
} from "../domain/request.entity";
import { requestsApi } from "./requests.api";

export class RequestRepositoryImpl implements IRequestRepository {
  // ─── Citizen Operations ──────────────────────────────────

  async createRescueRequest(
    data: CreateRescueRequestData,
  ): Promise<RescueRequest> {
    const response = await requestsApi.createRescueRequest(data);
    return (response as any).data;
  }

  async createEmergencyRequest(
    data: EmergencyRequestData,
  ): Promise<RescueRequest> {
    const response = await requestsApi.createEmergencyRequest(data);
    return (response as any).data;
  }

  async getMyRequests(filters?: GetRequestsFilter): Promise<any> {
    const response = await requestsApi.getMyRequests(filters);
    const res = response as any;
    // API trả về { success, data: [], meta: { page, limit, total, totalPages } }
    return {
      data: res.data || [],
      total: res.meta?.total ?? 0,
      page: res.meta?.page ?? 1,
      limit: res.meta?.limit ?? 10,
      totalPages: res.meta?.totalPages ?? 1,
    };
  }

  async getHistory(): Promise<RescueRequest[]> {
    const response = await requestsApi.getHistory();
    return (response as any).data || [];
  }

  async getRequestDetail(requestId: string): Promise<CoordinatorRequest> {
    const response = await requestsApi.getRequestDetail(requestId);
    const unwrapped = (response as any).data ?? response;
    return unwrapped as CoordinatorRequest;
  }

  async confirmRequest(requestId: string): Promise<void> {
    await requestsApi.confirmRequest(requestId);
  }

  // ─── Coordinator Operations ──────────────────────────────

  async getAllRequests(
    filters?: GetRequestsFilter,
  ): Promise<PaginatedRequests> {
    const response = await requestsApi.getAllRequests(filters);
    const result = response as any;

    // If response already matches PaginatedRequests structure
    if (
      result &&
      "total" in result &&
      "totalPages" in result &&
      !("meta" in result)
    ) {
      return result as PaginatedRequests;
    }

    return {
      data: result.data ?? [],
      total: result.meta?.total ?? 0,
      page: result.meta?.page ?? 1,
      limit: result.meta?.limit ?? 10,
      totalPages: result.meta?.totalPages ?? 1,
    };
  }

  async verifyRequest(
    requestId: string,
    input: VerifyRequestInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.verifyRequest(requestId, input);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async closeRequest(requestId: string): Promise<CoordinatorRequest> {
    const response = await requestsApi.closeRequest(requestId);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async markDuplicate(
    requestId: string,
    input: MarkDuplicateInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.markDuplicate(requestId, input);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async updateLocation(
    requestId: string,
    input: UpdateLocationInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.updateLocation(requestId, input);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async updateRequestPriority(
    requestId: string,
    input: UpdatePriorityInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.updateRequestPriority(
      requestId,
      input.priority,
    );
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async cancelRequest(
    requestId: string,
    input?: CancelRequestInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.cancelRequest(requestId, input);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async createOnBehalf(
    input: CreateOnBehalfInput,
  ): Promise<CoordinatorRequest> {
    const response = await requestsApi.createOnBehalf(input as any);
    return ((response as any).data ?? response) as CoordinatorRequest;
  }

  async searchCitizens(query: string): Promise<CitizenSearchResult[]> {
    const response = await requestsApi.searchCitizens(query);
    return ((response as any).data ?? []) as CitizenSearchResult[];
  }

  // ─── Legacy (deprecated) ─────────────────────────────────

  /** @deprecated Use verifyRequest instead */
  async updateRequestStatus(requestId: string, status: string): Promise<void> {
    await requestsApi.updateRequestStatus(requestId, status);
  }
}

// Singleton instance
export const requestRepository = new RequestRepositoryImpl();
