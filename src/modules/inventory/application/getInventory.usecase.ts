/**
 * Get Supplies Use Case - Application layer
 * Lấy danh sách vật tư từ kho
 */
import { InventoryItem } from '../domain/inventory.entity';
import { IInventoryRepository } from '@/modules/inventory/domain/inventory.repository';

export class GetSuppliesUseCase {
    constructor(private readonly IInventoryRepository: IInventoryRepository) {}

    /**
     * Execute get supplies
     * @returns InventoryItem[] - Danh sách vật tư
     */
    async execute(): Promise<InventoryItem[]> {
        try {
            const inventoryItems = await this.IInventoryRepository.getItems();
            
            if (!inventoryItems || !Array.isArray(inventoryItems)) {
                throw new Error('Dữ liệu vật tư không hợp lệ');
            }
            return inventoryItems;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Không thể lấy danh sách vật tư: ${error.message}`);
            }
            throw error;
        }
    }
}
