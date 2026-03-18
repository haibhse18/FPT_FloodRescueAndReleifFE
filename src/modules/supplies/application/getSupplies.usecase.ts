/**
 * Get Supplies Use Case - Application layer
 * Lấy danh sách vật tư từ kho
 */

import { ISupplyRepository } from '../domain/supply.repository';
import { Supply } from '../domain/supply.entity';

export class GetSuppliesUseCase {
    constructor(private readonly supplyRepository: ISupplyRepository) { }

    /**
     * Execute get supplies
     * @returns Supply[] - Danh sách vật tư
     */
    async execute(): Promise<{ data: Supply[], meta: { page: number, totalPages: number, total: number } }> {
        try {
            const result = await this.supplyRepository.getSupplies();

            // validate đúng - result là object chứa data array
            if (!result || !Array.isArray(result.data)) {
                throw new Error('Dữ liệu vật tư không hợp lệ');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể lấy danh sách vật tư: ${error.message}`);
            }
            throw error;
        }
    }
}
