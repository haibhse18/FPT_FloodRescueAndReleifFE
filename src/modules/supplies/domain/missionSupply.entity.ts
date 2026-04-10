/**
 * MissionSupply Entity - Domain layer
 * Represents supplies allocated to a mission
 */

export type MissionSupplyStatus = 
  | "REQUESTED"
  | "ALLOCATED"
  | "FULLY_CLAIMED"
  | "RETURNED";

export interface MissionSupplyMissionRef {
  _id: string;
  name?: string;
  code?: string;
  status?: string;
  type?: string;
  priority?: string;
}

export interface MissionSupply {
  _id: string;
  missionId: string | MissionSupplyMissionRef;
  supplyId: {
    _id: string;
    name: string;
    unit: string;
    category?: string;
  } | string | null;
  warehouseId?: {
    _id: string;
    name: string;
    location?: {
      coordinates: [number, number];
    };
  } | null;
  /** Combo vật tư được chọn bởi đội khi chấp nhận mission */
  comboSupplyId?: {
    _id: string;
    name: string;
    type?: string;
  } | string | null;
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
  missionId?: string;
  status?: MissionSupplyStatus | MissionSupplyStatus[];
  page?: number;
  limit?: number;
}
