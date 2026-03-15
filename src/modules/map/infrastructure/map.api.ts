/**
 * Map API - Infrastructure Layer
 * Handles geocoding, location services, and zone information
 */

import { apiClient } from '@/services/apiClient';
import { mapClient } from '@/services/mapClient';
import type { ApiResponse } from '@/shared/types/api';

export const mapApi = {
    /**
     * Reverse geocoding - Get address from coordinates
     * GET /reverse-geocode
     */
    reverseGeocode: async (lat: number, lng: number): Promise<ApiResponse> => {
        return mapClient.get(
            `/geocode/reverse?latlng=${lat},${lng}&apikey=${process.env.NEXT_PUBLIC_OPENMAP_API_KEY}`
        );
    },

    /**
     * Geocoding - Get coordinates from address
     * GET /geocode
     */
    geocode: async (address: string): Promise<ApiResponse> => {
        return mapClient.get(`/geocode?address=${encodeURIComponent(address)}`);
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
