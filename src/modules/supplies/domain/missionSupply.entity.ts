/**
 * MissionSupply Entity - Domain layer
 * Represents supplies allocated to a mission
 */

export type MissionSupplyStatus = 
  | "PENDING"
  | "ALLOCATED"
  | "FULLY_CLAIMED"
  | "RETURNED";

export interface MissionSupply {
  _id: string;
  missionId: string;
  supplyId: {
    _id: string;
    name: string;
    unit: string;
    category?: string;
  };
  warehouseId?: {
    _id: string;
    name: string;
    location?: {
      coordinates: [number, number];
    };
  };
  inventoryItemId?: string;
  plannedQty: number;
  allocatedQty: number;
  claimedQty: number;
  status: MissionSupplyStatus;
  allocatedBy?: string;
  allocatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMissionSuppliesFilter {
  missionId: string;
  status?: MissionSupplyStatus;
}
