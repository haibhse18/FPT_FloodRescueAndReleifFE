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

  async getMyRequests(filters?: GetRequestsFilter): Promise<RescueRequest[]> {
    const response = await requestsApi.getMyRequests(filters);
    const result = response as any;
    const items = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : [];
    const total = result.total ?? result.meta?.total ?? items.length;
    const page = result.page ?? result.meta?.page ?? filters?.page ?? 1;
    const limit =
      result.limit ??
      result.meta?.limit ??
      filters?.limit ??
      items.length ??
      1;
    const totalPages =
      result.totalPages ??
      result.meta?.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(1, Number(limit))));

    return Object.assign([...items], {
      total,
      page,
      limit,
      totalPages,
    }) as RescueRequest[];
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

    // Handle variety of response structures
    const items = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : [];

    const total = result.total ?? result.meta?.total ?? items.length;
    const page = result.page ?? result.meta?.page ?? filters?.page ?? 1;
    const limit = result.limit ?? result.meta?.limit ?? (filters?.limit || items.length || 10);
    const totalPages = result.totalPages ?? result.meta?.totalPages ?? Math.max(1, Math.ceil(total / Number(limit)));

    return {
      data: items,
      total,
      page,
      limit: Number(limit),
      totalPages,
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
