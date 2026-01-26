/**
 * Upload Client - Global Infrastructure Service
 * 
 * Handles file uploads to cloud storage (Cloudinary).
 * Infrastructure-only service, no business logic.
 */

import { apiClient } from './apiClient';

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
}

/**
 * Get upload signature from backend
 * Used for secure signed uploads to Cloudinary
 */
async function getSignature(folder: string = 'rescue_requests'): Promise<CloudinarySignatureResponse> {
    return apiClient.post<CloudinarySignatureResponse>('/cloudinary/signature', { folder });
}

/**
 * Upload single image using backend API route (recommended)
 * @param file - File to upload
 * @returns Upload response with secure URL
 */
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const data: UploadResponse = await response.json();
    if (!data.success || !data.url) {
        throw new Error('Invalid upload response');
    }

    return data.url;
}

/**
 * Upload single image using signed upload (legacy)
 * @param file - File to upload
 * @returns Image URL
 */
export async function uploadImageSigned(file: File): Promise<string> {
    try {
        // Get signature from backend
        const signatureData = await getSignature('rescue_requests');
        const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

        // Create FormData with signed upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', folder);

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @returns Array of image URLs
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => uploadImage(file));
    return Promise.all(uploadPromises);
}

export const uploadClient = {
    uploadImage,
    uploadImageSigned,
    uploadMultipleImages,
    getSignature,
};
