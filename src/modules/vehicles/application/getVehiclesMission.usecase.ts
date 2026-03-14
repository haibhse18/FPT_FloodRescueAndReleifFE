import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle } from "../domain/vehicles.enity";

export class GetVehiclesMissionUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    const { vehicles } = await this.vehicleRepository.getVehicles();
    return vehicles;
  }
}
