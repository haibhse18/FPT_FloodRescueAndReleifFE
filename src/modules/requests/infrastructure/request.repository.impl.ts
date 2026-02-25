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
} from "../domain/request.entity";
import { requestsApi } from "./requests.api";

export class RequestRepositoryImpl implements IRequestRepository {
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
    return (response as any).data || [];
  }

  async getHistory(): Promise<RescueRequest[]> {
    const response = await requestsApi.getHistory();
    return (response as any).data || [];
  }

  async getRequestDetail(requestId: string): Promise<RescueRequest> {
    const response = await requestsApi.getRequestDetail(requestId);
    // Backend may return { data: Request } (wrapped) or Request directly (unwrapped)
    const unwrapped = (response as any).data ?? response;
    return unwrapped as RescueRequest;
  }

  async confirmRequest(requestId: string): Promise<void> {
    await requestsApi.confirmRequest(requestId);
  }

  async cancelRequest(requestId: string): Promise<void> {
    await requestsApi.cancelRequest(requestId);
  }

  async getAllRequests(filters?: GetRequestsFilter): Promise<any> {
    const response = await requestsApi.getAllRequests(filters);
    return (response as any).data;
  }

  async updateRequestStatus(requestId: string, status: string): Promise<void> {
    // Map legacy status calls to the correct swagger endpoints
    if (status === "VERIFIED" || status === "Verified" || status === "approved") {
      await requestsApi.verifyRequest(requestId, true);
    } else if (status === "REJECTED" || status === "Rejected" || status === "rejected") {
      await requestsApi.verifyRequest(requestId, false);
    } else if (status === "CLOSED" || status === "Closed") {
      await requestsApi.closeRequest(requestId);
    } else if (status === "CANCELLED" || status === "Cancelled") {
      await requestsApi.cancelRequest(requestId);
    } else {
      // Fallback: try verify with approved=true for any other forward transition
      await requestsApi.verifyRequest(requestId, true);
    }
  }

  async updateRequestPriority(
    requestId: string,
    priority: string,
  ): Promise<void> {
    await requestsApi.updateRequestPriority(requestId, priority);
  }
}

// Singleton instance for easy access
export const requestRepository = new RequestRepositoryImpl();
