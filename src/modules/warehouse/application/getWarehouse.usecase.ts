import { IWarehouseRepository } from '../domain/warehouse.repository';
import { Warehouse } from '../domain/warehouse.entity';

export class GetWarehouseUseCase {
    constructor(private readonly WarehouseRepository: IWarehouseRepository) { }

    async execute(): Promise<{
        warehouses: Warehouse[]
        total: number
    }> {
        return this.WarehouseRepository.getWarehouses();
    }
}

