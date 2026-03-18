import { warehouseApi } from "./warehouse.api";
import { Warehouse } from "../domain/warehouse.entity";
import { IWarehouseRepository } from "../domain/warehouse.repository";

export class WarehouseRepositoryImpl implements IWarehouseRepository {



    async importExcel(file: File): Promise<void> {
        await warehouseApi.importExcel(file);
    }

    async getWarehouses(): Promise<{ warehouses: Warehouse[]; total: number; }> {
        const result = await warehouseApi.getWarehouses();

        return result?.data ?? [];
    }
}
export const warehouseRepository = new WarehouseRepositoryImpl();