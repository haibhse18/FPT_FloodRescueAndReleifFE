import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle } from "../domain/vehicles.enity";

export class GetVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) { }

  async execute(): Promise<{
    vehicles: Vehicle[]
    total: number
  }> {
    return this.vehicleRepository.getVehicles();
  }
}

