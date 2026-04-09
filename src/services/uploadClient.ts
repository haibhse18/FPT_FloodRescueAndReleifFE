/**
 * Upload Client - Global Infrastructure Service
 *
 * Handles file uploads to cloud storage (Cloudinary).
 * Infrastructure-only service, no business logic.
 */

import { apiClient } from "./apiClient";

export interface UploadResponse {
  success: boolean;
  url: string;
  publicId?: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  context?: string;
  eager?: string;
  eager_async?: boolean;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  eager?: Array<{ secure_url: string }>;
}

import { ApiResponse } from "@/types";

/**
 * Get upload signature from backend
 * Used for secure signed uploads to Cloudinary
 */
async function getSignature(
  folder: string = "rescue_requests",
  context?: Record<string, string>,
  eager: boolean = false,
): Promise<CloudinarySignatureResponse> {
  const response = await apiClient.post<
    ApiResponse<CloudinarySignatureResponse>
  >("/cloudinary/signature", { folder, context, eager });
  if (!response.data) {
    throw new Error("No data received from signature endpoint");
  }
  return response.data;
}

/**
 * Upload single image using direct signed upload (recommended)
 * @param file - File to upload
 * @param folder - Cloudinary folder name
 * @param context - Optional metadata context
 * @param eager - Generate eager transformations (thumbnails)
 * @returns Upload result with URLs and metadata
 */
export async function uploadImage(
  file: File,
  folder: string = "rescue_requests",
  context?: Record<string, string>,
  eager: boolean = false,
): Promise<CloudinaryUploadResult> {
  try {
    // Get signature from backend
    const signatureData = await getSignature(folder, context, eager);
    const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = signatureData;

    // Create FormData with signed upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("folder", signedFolder);

    // Use context string from backend signature if available
    if (signatureData.context) {
      formData.append("context", signatureData.context);
    }

    if (eager && signatureData.eager) {
      formData.append("eager", signatureData.eager);
      formData.append("eager_async", "true");
    }

    // Upload directly to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data: CloudinaryUploadResult = await response.json();
    return data;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Upload single image and return only the URL (simplified version)
 * @param file - File to upload
 * @param folder - Cloudinary folder name
 * @param context - Optional metadata context
 * @returns Image URL
 */
export async function uploadImageSimple(
  file: File,
  folder: string = "rescue_requests",
  context?: Record<string, string>,
): Promise<string> {
  const result = await uploadImage(file, folder, context, false);
  return result.secure_url;
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param folder - Cloudinary folder name
 * @param context - Optional metadata context
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = "rescue_requests",
  context?: Record<string, string>,
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder, context, false));
  return Promise.all(uploadPromises);
}

/**
 * Get optimized URL for a Cloudinary public_id
 * @param publicId - Cloudinary public ID
 * @param transformation - Transformation preset (thumbnail, medium, avatar)
 * @returns Optimized image URL
 */
export function getOptimizedUrl(
  publicId: string,
  transformation: "thumbnail" | "medium" | "avatar" = "medium",
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured");
  }

  const transformations = {
    thumbnail: "w_300,h_300,c_fill,q_auto:low,f_auto",
    medium: "w_800,h_800,c_limit,q_auto:good,f_auto",
    avatar: "w_200,h_200,c_fill,g_face,q_auto,f_auto",
  };

  const transform = transformations[transformation];
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

export const uploadClient = {
  uploadImage,
  uploadImageSimple,
  uploadMultipleImages,
  getOptimizedUrl,
  getSignature,
};
