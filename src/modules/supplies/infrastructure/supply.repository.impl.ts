/**
 * Supply Repository Implementation - Infrastructure layer
 * Implement ISupplyRepository interface using supplyApi
 */

import { ISupplyRepository } from '../domain/supply.repository';
import {
    Supply,
    SupplyRequest,
    CreateSupplyRequestData,
} from '../domain/supply.entity';
import { supplyApi } from './supply.api';

export class SupplyRepositoryImpl implements ISupplyRepository {
    async getSupplies(): Promise<Supply[]> {
    const result = await supplyApi.getSupplies();
    return result?.data ?? [];
}

    async getSupplyRequests(): Promise<SupplyRequest[]> {
        const requests = await supplyApi.getSupplyRequests();
        return requests;
    }

    async createSupplyRequest(data: CreateSupplyRequestData): Promise<SupplyRequest> {
        const request = await supplyApi.createSupplyRequest(data);
        return request;
    }

    async updateSupplyStatus(id: string, status: string): Promise<void> {
        await supplyApi.updateSupplyStatus(id, status);
    }

    async importExcel(file: File): Promise<void> {
        await supplyApi.importExcel(file);
    }
}

// Singleton instance for easy access
export const supplyRepository = new SupplyRepositoryImpl();
