/**
 * API Response Types
 * Define standardized response types for API endpoints
 */

/**
 * API Response Types
 * Define standardized response types for API endpoints
 */

export type {
  ApiResponse,
  PaginatedResponse,
  ApiMeta,
  ApiError,
} from "@/types";

// Rescue Request Response Types
export interface RescueRequestResponse {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  location: string;
  description: string;
  dangerType: string;
  numberOfPeople: number;
  urgencyLevel: string;
  status: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Upload Response Type
export interface UploadResponse {
  success: boolean;
  url: string;
  publicId?: string;
}

// Notification Response Type
export interface NotificationResponse {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Mission Response Type
export interface MissionResponse {
  id: string;
  requestId: string;
  teamId: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedAt: string;
  completedAt?: string;
}
