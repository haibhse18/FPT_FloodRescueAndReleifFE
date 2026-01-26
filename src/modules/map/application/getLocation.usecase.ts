/**
 * Get Location Use Case - Application layer
 * Handle location-related operations
 */

import { IMapRepository } from '../domain/map.repository';
import { Location, Coordinates } from '../domain/location.entity';

export class GetLocationUseCase {
    constructor(private readonly mapRepository: IMapRepository) {}

    /**
     * Get address from coordinates
     */
    async getAddressFromCoordinates(coordinates: Coordinates): Promise<Location> {
        if (!coordinates.latitude || !coordinates.longitude) {
            throw new Error('Tọa độ không hợp lệ');
        }

        return this.mapRepository.reverseGeocode(coordinates);
    }

    /**
     * Get coordinates from address
     */
    async getCoordinatesFromAddress(address: string): Promise<Location> {
        if (!address || address.trim() === '') {
            throw new Error('Địa chỉ không được để trống');
        }

        return this.mapRepository.geocode(address);
    }
}
