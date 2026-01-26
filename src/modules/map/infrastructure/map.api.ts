/**
 * Map API - Infrastructure Layer
 * Handles geocoding, location services, and zone information
 */

import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';

export const mapApi = {
    /**
     * Reverse geocoding - Get address from coordinates
     * GET /reverse-geocode
     */
    reverseGeocode: async (lat: number, lng: number): Promise<ApiResponse> => {
        return apiClient.get(`/reverse-geocode?lat=${lat}&lng=${lng}`);
    },

    /**
     * Geocoding - Get coordinates from address
     * GET /geocode
     */
    geocode: async (address: string): Promise<ApiResponse> => {
        return apiClient.get(`/geocode?address=${encodeURIComponent(address)}`);
    },

    /**
     * Get flood zones (dangerous areas)
     * GET /map/flood-zones
     */
    getFloodZones: async (): Promise<ApiResponse> => {
        return apiClient.get('/map/flood-zones');
    },

    /**
     * Get safe zones (evacuation areas)
     * GET /map/safe-zones
     */
    getSafeZones: async (): Promise<ApiResponse> => {
        return apiClient.get('/map/safe-zones');
    },
};
