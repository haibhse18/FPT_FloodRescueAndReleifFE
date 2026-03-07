import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle } from "../domain/vehicles.enity";

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(data: Partial<Vehicle>): Promise<Vehicle> {
    if (!data.licensePlate) {
      throw new Error("License plate is required");
    }

    const vehicle = await this.vehicleRepository.createVehicle(data);

    if (!vehicle?.id) {
      throw new Error("Cannot create vehicle");
    }

    return vehicle;
  }
}