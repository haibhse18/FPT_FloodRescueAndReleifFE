import { IVehicleRepository } from "../domain/vehicles.repository";
import { VehicleStatus } from "../domain/vehicles.enity";

export class UpdateVehicleStatusUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, status: VehicleStatus): Promise<void> {
    if (!id || !status) {
      throw new Error("Invalid vehicle data");
    }

    await this.vehicleRepository.updateVehicleStatus(id, status);
  }
}