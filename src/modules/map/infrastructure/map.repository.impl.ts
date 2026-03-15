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
        const data = (response as any);

        // OpenMap API returns: { results: [{ formatted_address, address_components, ... }], status: "OK" }
        const result = data?.results?.[0];
        const components = result?.address_components || [];

        // Component order: [0] name, [1] street, [2] ward, [3] district, [4] city
        const street   = components[1]?.long_name || components[0]?.long_name;
        const ward     = components[2]?.long_name;
        const district = components[3]?.long_name;
        const city     = components[4]?.long_name || components[3]?.long_name;

        const display =
            result?.formatted_address ||
            `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;

        return {
            coordinates,
            address: {
                display,
                street,
                district: ward ? `${ward}, ${district}` : district,
                city,
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
