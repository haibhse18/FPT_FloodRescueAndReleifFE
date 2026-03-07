import { Vehicle, VehicleStatus } from "./vehicles.enity";

export interface IVehicleRepository {
  getVehicles(): Promise<Vehicle[]>;

  getVehicleById(id: string): Promise<Vehicle | null>;

  createVehicle(data: Partial<Vehicle>): Promise<Vehicle>;

  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle>;

  updateVehicleStatus(id: string, status: VehicleStatus): Promise<void>;

  deleteVehicle(id: string): Promise<void>;
}