/**
 * Vehicles Module Exports
 * Clean Architecture: Domain, Application, Infrastructure, Presentation
 */

// =======================
// Domain
// =======================

export type {
  Vehicle,
  VehicleStatus,
  VehicleType,
  VehicleCapacityUnit,
} from "./domain/vehicles.enity";

export type { IVehicleRepository } from "./domain/vehicles.repository";


// =======================
// Application (UseCases)
// =======================

export { GetVehiclesUseCase } from "./application/getVehicles.usecase";
export { CreateVehicleUseCase } from "./application/createVehiclesMission.usecase";
export { UpdateVehicleStatusUseCase } from "./application/updateVehiclesStatus.usecase";


// =======================
// Infrastructure
// =======================

export { vehicleApi } from "./infrastructure/vehicles.api";

export {
  vehicleRepository,
  VehicleRepositoryImpl,
} from "./infrastructure/vehicles.repository.impl";


// =======================
// Presentation - Components
// =======================

export { VehicleList } from "./presentation/components/VehicleList";


// =======================
// Presentation - Pages
// =======================

export { default as VehiclesManagement } from "./presentation/pages/VehiclesManagement";