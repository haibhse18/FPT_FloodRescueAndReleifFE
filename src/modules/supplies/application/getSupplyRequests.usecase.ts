/**
 * Get Supply Requests Use Case - Application layer
 * Lấy danh sách yêu cầu cung cấp vật tư
 */

import { ISupplyRepository } from '../domain/supply.repository';
import { SupplyRequest } from '../domain/supply.entity';

export class GetSupplyRequestsUseCase {
    constructor(private readonly supplyRepository: ISupplyRepository) { }

    /**
     * Execute get supply requests
     * @returns SupplyRequest[] - Danh sách yêu cầu
     */
    async execute(): Promise<SupplyRequest[]> {
        try {
            const requests = await this.supplyRepository.getSupplyRequests();

            if (!requests || !Array.isArray(requests)) {
                throw new Error('Dữ liệu yêu cầu không hợp lệ');
            }

            return requests;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể lấy danh sách yêu cầu: ${error.message}`);
            }
            throw error;
        }
    }
}