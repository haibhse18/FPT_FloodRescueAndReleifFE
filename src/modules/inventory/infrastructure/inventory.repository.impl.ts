import { IInventoryRepository } from '../domain/inventory.repository';
import { InventoryItem, UpdateInventoryData } from '../domain/inventory.entity';
import { inventoryApi } from './inventory.api';

export const inventoryRepository: IInventoryRepository = {
    async getItems(): Promise<InventoryItem[]> {
        const response = await inventoryApi.getItems();
        return response.data;
    },

    async updateItem(id: string, data: UpdateInventoryData): Promise<InventoryItem> {
        throw new Error('Method not implemented.');
    },

    async deleteItem(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    },

    async importExcel(file: File, importType: string): Promise<void> {
        await inventoryApi.importExcel(file, importType);
    }
};
