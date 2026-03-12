import { IInventoryRepository } from '../domain/inventory.repository';
import { Warehouse } from '../domain/warehouse.entity';

export class GetWarehousesUseCase {
    constructor(private readonly inventoryRepository: IInventoryRepository) {}

    async execute(): Promise<Warehouse[]> {
        try {
            const items = await this.inventoryRepository.getItems();
            if (!items || !items.length) return [];

            const uniqueWarehouses = new Map<string, Warehouse>();
            items.forEach((item) => {
                if (item.warehouse && typeof item.warehouse !== "string") {
                    const wh = item.warehouse as Warehouse;
                    if (wh._id && !uniqueWarehouses.has(wh._id)) {
                        uniqueWarehouses.set(wh._id, wh);
                    }
                }
            });

            return Array.from(uniqueWarehouses.values());
        } catch (error) {
            console.error("Error in GetWarehousesUseCase:", error);
            return [];
        }
    }
}
