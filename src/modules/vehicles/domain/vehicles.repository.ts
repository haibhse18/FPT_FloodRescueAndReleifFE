import { Vehicle, VehicleStatus } from "./vehicles.enity";

export interface IVehicleRepository {
  getVehicles(): Promise<{vehicles: Vehicle[], total: number}>;
  createVehicle(data: Partial<Vehicle>): Promise<Vehicle>;
  updateVehicleStatus(id: string, status: VehicleStatus): Promise<void>;
  importExcel(file: File): Promise<void>;
}