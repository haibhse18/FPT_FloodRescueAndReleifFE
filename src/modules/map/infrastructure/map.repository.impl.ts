/**
 * Map Repository Implementation - Infrastructure layer
 * Implement IMapRepository interface using mapApi
 */

import { IMapRepository } from '../domain/map.repository';
import { Location, FloodZone, SafeZone, Coordinates } from '../domain/location.entity';
import { mapApi } from './map.api';

export class MapRepositoryImpl implements IMapRepository {
    async reverseGeocode(coordinates: Coordinates): Promise<Location> {
        const response = await mapApi.reverseGeocode(coordinates.latitude, coordinates.longitude);
        const data = (response as any).data;
        return {
            coordinates,
            address: {
                display: data?.display_name || `${coordinates.latitude}, ${coordinates.longitude}`,
                city: data?.address?.city,
                district: data?.address?.district,
                street: data?.address?.street,
                country: data?.address?.country,
            },
        };
    }

    async geocode(address: string): Promise<Location> {
        const response = await mapApi.geocode(address);
        const data = (response as any).data;
        return {
            coordinates: {
                latitude: data?.lat || 0,
                longitude: data?.lon || 0,
            },
            address: {
                display: data?.display_name || address,
            },
        };
    }

    async getFloodZones(): Promise<FloodZone[]> {
        const response = await mapApi.getFloodZones();
        return (response as any).data || [];
    }

    async getSafeZones(): Promise<SafeZone[]> {
        const response = await mapApi.getSafeZones();
        return (response as any).data || [];
    }
}

// Singleton instance for easy access
export const mapRepository = new MapRepositoryImpl();
