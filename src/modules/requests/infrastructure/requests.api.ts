/**
 * Requests API - Infrastructure Layer
 * Handles citizen rescue request operations
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

export interface CreateRescueRequestDTO {
  type: "Rescue" | "Relief";
  incidentType?: "Flood" | "Trapped" | "Injured" | "Landslide" | "Other";
  location: { type: "Point"; coordinates: [number, number] };
  description: string;
  imageUrls?: string[];
  peopleCount?: number;
  requestSupplies?: Array<{ supplyId: string; requestedQty: number }>;
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
   * POST /requests
   */
  createRescueRequest: async (
    data: CreateRescueRequestDTO,
  ): Promise<ApiResponse> => {
    return apiClient.post("/requests", data, {
      headers: authSession.getAuthHeaders(),
    });
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
  confirmRequest: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/confirm`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Citizen cancel own request
   * PATCH /requests/{requestId}/cancel
   */
  cancelRequest: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.patch(
      `/requests/${requestId}/cancel`,
      undefined,
      { headers: authSession.getAuthHeaders() },
    );
  },

  /**
   * Get all requests (Coordinator)
   * GET /requests  (with filters)
   */
  getAllRequests: async (
    params?: GetRequestsParams & { userName?: string; source?: string },
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
    const endpoint = query ? `/requests?${query}` : `/requests`;

    return apiClient.get(endpoint, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * Update request priority (Coordinator)
   * PATCH /requests/{requestId}/priority
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

  /**
   * Verify (approve/reject) a request (Coordinator)
   * PATCH /requests/{id}/verify
   */
  verifyRequest: async (
    requestId: string,
    approved: boolean,
    priority?: string,
    notes?: string,
  ): Promise<ApiResponse> => {
    return apiClient.patch(
      `/requests/${requestId}/verify`,
      { approved, ...(priority ? { priority } : {}), ...(notes ? { notes } : {}) },
      { headers: authSession.getAuthHeaders() },
    );
  },

  /**
   * Close a fulfilled request (Coordinator)
   * PATCH /requests/{id}/close
   */
  closeRequest: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.patch(
      `/requests/${requestId}/close`,
      undefined,
      { headers: authSession.getAuthHeaders() },
    );
  },
};
