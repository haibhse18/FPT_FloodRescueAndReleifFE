import { Vehicle} from "./vehicles.enity";

export interface IVehicleRepository {
  getVehicles(): Promise<{vehicles: Vehicle[], total: number}>;
  importExcel(file: File): Promise<void>;
}