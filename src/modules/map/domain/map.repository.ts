/**
 * Map Repository Interface - Domain layer
 * Định nghĩa contract cho map operations, không phụ thuộc implementation
 */

import { Location, FloodZone, SafeZone, Coordinates } from './location.entity';

export interface IMapRepository {
    /**
     * Lấy địa chỉ từ tọa độ (reverse geocoding)
     */
    reverseGeocode(coordinates: Coordinates): Promise<Location>;

    /**
     * Lấy tọa độ từ địa chỉ (geocoding)
     */
    geocode(address: string): Promise<Location>;

    /**
     * Lấy danh sách vùng ngập lụt nguy hiểm
     */
    getFloodZones(): Promise<FloodZone[]>;

    /**
     * Lấy danh sách vùng an toàn
     */
    getSafeZones(): Promise<SafeZone[]>;
}
