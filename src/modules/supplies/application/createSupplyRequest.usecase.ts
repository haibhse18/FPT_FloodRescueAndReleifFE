/**
 * Create Supply Request Use Case - Application layer
 * Tạo yêu cầu cung cấp vật tư mới
 */

import { ISupplyRepository } from '../domain/supply.repository';
import { SupplyRequest, CreateSupplyRequestData } from '../domain/supply.entity';

export class CreateSupplyRequestUseCase {
    constructor(private readonly supplyRepository: ISupplyRepository) {}

    /**
     * Execute create supply request
     * @param data - Dữ liệu yêu cầu
     * @returns SupplyRequest - Yêu cầu vừa tạo
     */
    async execute(data: CreateSupplyRequestData): Promise<SupplyRequest> {
        try {
            // Validate dữ liệu đầu vào
            if (!data.requestId || !data.items || data.items.length === 0) {
                throw new Error('Dữ liệu yêu cầu không hợp lệ');
            }

            const request = await this.supplyRepository.createSupplyRequest(data);
            
            if (!request || !request.id) {
                throw new Error('Không thể tạo yêu cầu');
            }

            return request;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể tạo yêu cầu: ${error.message}`);
            }
            throw error;
        }
    }
}
