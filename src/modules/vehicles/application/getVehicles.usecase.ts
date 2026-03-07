import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle } from "../domain/vehicles.enity";

export class GetVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    const vehicles = await this.vehicleRepository.getVehicles();

    if (!Array.isArray(vehicles)) {
      throw new Error("Vehicle data invalid");
    }

    return vehicles;
  }
}