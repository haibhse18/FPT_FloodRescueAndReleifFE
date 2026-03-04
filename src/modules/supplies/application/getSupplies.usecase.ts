/**
 * Get Supplies Use Case - Application layer
 * Lấy danh sách vật tư từ kho
 */

import { ISupplyRepository } from '../domain/supply.repository';
import { Supply } from '../domain/supply.entity';

export class GetSuppliesUseCase {
    constructor(private readonly supplyRepository: ISupplyRepository) {}

    /**
     * Execute get supplies
     * @returns Supply[] - Danh sách vật tư
     */
    async execute(): Promise<Supply[]> {
        try {
            const supplies = await this.supplyRepository.getSupplies();
            
            if (!supplies || !Array.isArray(supplies)) {
                throw new Error('Dữ liệu vật tư không hợp lệ');
            }
            return supplies;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể lấy danh sách vật tư: ${error.message}`);
            }
            throw error;
        }
    }
}
