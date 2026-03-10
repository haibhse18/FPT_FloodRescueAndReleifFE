import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle } from "../domain/vehicles.enity";
import { vehicleApi } from "./vehicles.api";

export class VehicleRepositoryImpl implements IVehicleRepository {

  async getVehicles() {
  const result = await vehicleApi.getVehicles();

  return {
    vehicles: result?.data ?? [],
    total: result?.meta?.total ?? 0
  };
}
  async importExcel(file: File): Promise<void> {
          await vehicleApi.importExcel(file);
      }
}

export const vehicleRepository = new VehicleRepositoryImpl();