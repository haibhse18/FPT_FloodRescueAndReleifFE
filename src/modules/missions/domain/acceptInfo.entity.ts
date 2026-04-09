/**
 * Accept Info Entity - Domain layer
 * Data structure for GET /missions/:id/accept-info response
 */

import type { MissionRequest } from "./missionRequest.entity";
import type { ComboSupply } from "@/modules/supplies/domain/comboSupply.entity";
import type { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";

export interface WarehouseInventoryItem {
  supply: {
    _id: string;
    name: string;
    unit: string;
    category?: string;
  };
  quantity: number;
  reservedQuantity: number;
  available: number;
}

export interface WarehouseWithInventory {
  _id: string;
  name: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  inventory: WarehouseInventoryItem[];
}

export interface AcceptInfo {
  missionRequests: MissionRequest[];
  citizenCombos: ComboSupply[];
  teamCombos: ComboSupply[];
  warehouses: WarehouseWithInventory[];
  vehicles: Vehicle[];
}
