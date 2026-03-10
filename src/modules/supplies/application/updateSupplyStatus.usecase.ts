/**
 * Update Supply Status Use Case - Application layer
 * Cập nhật trạng thái vật tư
 */

import { ISupplyRepository } from '../domain/supply.repository';

export class UpdateSupplyStatusUseCase {
    constructor(private readonly supplyRepository: ISupplyRepository) {}

    /**
     * Execute update supply status
     * @param id - ID vật tư
     * @param status - Trạng thái mới
     */
    async execute(id: string, status: string): Promise<void> {
        try {
            if (!id || !status) {
                throw new Error('ID và trạng thái không được để trống');
            }

            await this.supplyRepository.updateSupplyStatus(id, status);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể cập nhật trạng thái: ${error.message}`);
            }
            throw error;
        }
    }
}
