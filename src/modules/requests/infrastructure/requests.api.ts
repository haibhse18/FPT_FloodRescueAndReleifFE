/**
 * Requests API - Infrastructure Layer
 * Handles citizen rescue request operations
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export interface CreateRescueRequestDTO {
  type?: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrls?: string[];
  priority?: string;
  peopleCount?: number;
  requestSupply?: unknown[];
  location?: string;
  dangerType?: string;
  numberOfPeople?: number;
  urgencyLevel?: string;
  images?: string[];
}

export interface EmergencyRequestDTO {
  location: { lat: number; lng: number };
  address: string;
  description: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  peopleCount: number;
  hasInjuries: boolean;
  hasChildren: boolean;
  hasElderly: boolean;
  phone: string;
}

export interface GetRequestsParams {
  status?: string;
  type?: string;
  incidentType?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export const requestsApi = {
  /**
   * Create a rescue request
   * POST /requests/addRequest
   */
  createRescueRequest: async (
    data: CreateRescueRequestDTO,
  ): Promise<ApiResponse> => {
    return apiClient.post("/requests/addRequest", data);
  },

  /**
   * Create emergency request (legacy)
   * POST /citizen/emergency-request
   */
  createEmergencyRequest: async (
    data: EmergencyRequestDTO,
  ): Promise<ApiResponse> => {
    return apiClient.post("/citizen/emergency-request", data, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Get user's rescue requests
   * GET /requests/my
   */
  getMyRequests: async (params?: GetRequestsParams): Promise<ApiResponse> => {
    const queryString =
      params ?
        "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return apiClient.get(`/requests/my${queryString}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Get request history
   * GET /citizen/history
   */
  getHistory: async (): Promise<ApiResponse> => {
    return apiClient.get("/citizen/history", {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Get request detail by ID
   * GET /requests/{id}
   */
  getRequestDetail: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.get(`/requests/${requestId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Citizen confirm safe / received
   * PATCH /requests/{id}/confirm
   */
  /**
   * Citizen confirm safe / received
   * PATCH /requests/{id}/confirm
   */
  confirmRequest: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/confirm`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Get all requests (Coordinator)
   * GET /requests/getAll
   */
  getAllRequests: async (
    params?: GetRequestsParams & { userName?: string },
  ): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/requests/getAll?${query}` : `/requests/getAll`;

    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Update request status (Coordinator)
   * PATCH /requests/{id}/status
   */
  updateRequestStatus: async (
    requestId: string,
    status: string,
  ): Promise<ApiResponse> => {
    return apiClient.patch(
      `/requests/${requestId}/status`,
      { status },
      { headers: authSession.getAuthHeaders() },
    );
  },

  /**
   * Update request priority (Coordinator)
   * PATCH /requests/{id}/priority
   */
  updateRequestPriority: async (
    requestId: string,
    priority: string,
  ): Promise<ApiResponse> => {
    return apiClient.patch(
      `/requests/${requestId}/priority`,
      { priority },
      { headers: authSession.getAuthHeaders() },
    );
  },
};
