import { IVehicleRepository } from "../domain/vehicles.repository";
import { Vehicle, VehicleStatus } from "../domain/vehicles.enity";
import { vehicleApi } from "./vehicles.api";

export class VehicleRepositoryImpl implements IVehicleRepository {

  async getVehicles(): Promise<Vehicle[]> {
    return vehicleApi.getVehicles();
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    const vehicles = await vehicleApi.getVehicles();
    return vehicles.find(v => v.id === id) || null;
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    return vehicleApi.createVehicle(data);
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return vehicleApi.updateVehicle(id, data);
  }

  async updateVehicleStatus(id: string, status: VehicleStatus): Promise<void> {
    await vehicleApi.updateVehicleStatus(id, status);
  }

  async deleteVehicle(id: string): Promise<void> {
    await vehicleApi.deleteVehicle(id);
  }
}

export const vehicleRepository = new VehicleRepositoryImpl();