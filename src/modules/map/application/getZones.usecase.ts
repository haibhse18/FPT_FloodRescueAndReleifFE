/**
 * Get Zones Use Case - Application layer
 * Handle flood and safe zones operations
 */

import { IMapRepository } from '../domain/map.repository';
import { FloodZone, SafeZone } from '../domain/location.entity';

export class GetZonesUseCase {
    constructor(private readonly mapRepository: IMapRepository) {}

    /**
     * Get all flood zones
     */
    async getFloodZones(): Promise<FloodZone[]> {
        return this.mapRepository.getFloodZones();
    }

    /**
     * Get all safe zones
     */
    async getSafeZones(): Promise<SafeZone[]> {
        return this.mapRepository.getSafeZones();
    }
}
