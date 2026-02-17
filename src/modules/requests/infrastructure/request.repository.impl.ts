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
    return (response as any).data;
  }

  async confirmRequest(requestId: string): Promise<void> {
    await requestsApi.confirmRequest(requestId);
  }

  async getAllRequests(filters?: GetRequestsFilter): Promise<any> {
    const response = await requestsApi.getAllRequests(filters);
    return (response as any).data;
  }

  async updateRequestStatus(requestId: string, status: string): Promise<void> {
    await requestsApi.updateRequestStatus(requestId, status);
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
