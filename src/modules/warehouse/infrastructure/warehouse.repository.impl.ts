import { warehouseApi } from "./warehouse.api";
import { Warehouse } from "../domain/warehouse.entity";
import { IWarehouseRepository } from "../domain/warehouse.repository";

export class WarehouseRepositoryImpl implements IWarehouseRepository {



    async importExcel(file: File): Promise<void> {
        await warehouseApi.importExcel(file);
    }

    async getWarehouses() {
        const result = await warehouseApi.getWarehouses();

        return {
            warehouses: result?.data ?? [],
            total: result?.meta?.total ?? 0
        };
    }
}
export const warehouseRepository = new WarehouseRepositoryImpl();