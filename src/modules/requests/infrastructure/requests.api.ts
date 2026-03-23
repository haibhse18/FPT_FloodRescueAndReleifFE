/**
 * Requests API - Infrastructure Layer
 * Handles citizen + coordinator request operations (Unified v2.2)
 */

import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";

// ─── Param Types ─────────────────────────────────────────

export interface GetRequestsParams {
  status?: string;
  type?: string;
  incidentType?: string;
  priority?: string;
  source?: string;
  userName?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

// ─── Legacy DTOs (citizen pages) ─────────────────────────

export interface CreateRescueRequestDTO {
  type?: string;
  incidentType?: string;
  latitude?: number;
  longitude?: number;
  description: string;
  imageUrls?: string[];
  priority?: string;
  peopleCount?: number;
  requestSupply?: unknown[];
  requestSupplies?: { supplyId: string; requestedQty: number }[];
  location?: string | { type?: string; coordinates: [number, number] };
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

// ─── API Object ──────────────────────────────────────────

export const requestsApi = {
  // ────────────────────────────────────────────────────────
  // CITIZEN ENDPOINTS
  // ────────────────────────────────────────────────────────

  /** POST /requests */
  createRescueRequest: async (
    data: CreateRescueRequestDTO,
  ): Promise<ApiResponse> => {
    return apiClient.post("/requests", data, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * @deprecated No matching endpoint in swagger.
   * Use createRescueRequest (POST /requests) with CreateRescueRequestDTO instead.
   */
  createEmergencyRequest: async (
    data: EmergencyRequestDTO,
  ): Promise<ApiResponse> => {
    return apiClient.post(
      "/requests",
      {
        type: "Rescue",
        incidentType: "Other",
        description: data.description,
        priority:
          data.urgencyLevel === "critical"
            ? "Critical"
            : data.urgencyLevel === "high"
              ? "High"
              : "Normal",
        peopleCount: data.peopleCount,
        location: {
          type: "Point",
          coordinates: [data.location.lng, data.location.lat],
        },
      },
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  /** GET /requests/my */
  getMyRequests: async (params?: GetRequestsParams): Promise<ApiResponse> => {
    const queryString =
      params ?
        "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";
    return apiClient.get(`/requests/my${queryString}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /requests/my — alias for getMyRequests (replaces old /citizen/history) */
  getHistory: async (): Promise<ApiResponse> => {
    return apiClient.get("/requests/my", {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /requests/{requestId} */
  getRequestDetail: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.get(`/requests/${requestId}`, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /**
   * @deprecated No matching endpoint in swagger — this endpoint does not exist.
   * Citizens should use cancelRequest if needed.
   */
  confirmRequest: async (requestId: string): Promise<ApiResponse> => {
    throw new Error(
      "Endpoint /requests/{requestId}/confirm khong co trong Swagger hien tai.",
    );
  },

  // ────────────────────────────────────────────────────────
  // COORDINATOR ENDPOINTS
  // ────────────────────────────────────────────────────────

  /** GET /requests — list all requests with filters */
  getAllRequests: async (params?: GetRequestsParams): Promise<ApiResponse> => {
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

  /** PATCH /requests/{id}/verify — verify or reject */
  verifyRequest: async (
    requestId: string,
    input: { approved: boolean; priority?: string; reason?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/verify`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /requests/{id}/close — close fulfilled request */
  closeRequest: async (requestId: string): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/close`, undefined, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /requests/{id}/duplicate — mark as duplicate */
  markDuplicate: async (
    requestId: string,
    input: { duplicatedOfRequestId: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/duplicate`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /requests/{id}/location — update location */
  updateLocation: async (
    requestId: string,
    input: {
      location: { type: string; coordinates: [number, number] };
      isLocationVerified?: boolean;
    },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/location`, input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** PATCH /requests/{id}/priority — update priority */
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

  /** PATCH /requests/{id}/cancel — coordinator cancel */
  cancelRequest: async (
    requestId: string,
    input?: { reason?: string },
  ): Promise<ApiResponse> => {
    return apiClient.patch(`/requests/${requestId}/cancel`, input ?? {}, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** POST /requests/on-behalf — create request on behalf of citizen */
  createOnBehalf: async (input: {
    citizenId?: string;
    userName?: string;
    phoneNumber?: string;
    type: string;
    incidentType?: string;
    location: { type: string; coordinates: [number, number] };
    description: string;
    peopleCount?: number;
    priority?: string;
    requestSupplies?: { supplyId: string; requestedQty: number }[];
    imageUrls?: string[];
  }): Promise<ApiResponse> => {
    return apiClient.post("/requests/on-behalf", input, {
      headers: authSession.getAuthHeaders(),
    });
  },

  /** GET /requests/search-citizens?q=... */
  searchCitizens: async (q: string): Promise<ApiResponse> => {
    return apiClient.get(
      `/requests/search-citizens?q=${encodeURIComponent(q)}`,
      {
        headers: authSession.getAuthHeaders(),
      },
    );
  },

  // ────────────────────────────────────────────────────────
  // LEGACY (deprecated — kept for backward compat)
  // ────────────────────────────────────────────────────────

  /** @deprecated Use verifyRequest instead */
  updateRequestStatus: async (
    requestId: string,
    status: string,
  ): Promise<ApiResponse> => {
    throw new Error(
      `Endpoint /requests/{requestId}/status khong co trong Swagger hien tai. Khong the cap nhat sang ${status}.`,
    );
  },
};
