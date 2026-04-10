/**
 * TimelineSupply Entity - Domain layer
 * Represents supplies reserved/claimed by a team for a specific timeline
 */

export type TimelineSupplyStatus =
  | "RESERVED"
  | "APPROVED"
  | "REJECTED"
  | "CLAIMED"
  | "RETURNED";

export interface TimelineSupply {
  _id: string;
  timelineId: string;
  missionSupplyId?: string;
  comboSupplyId?: string;
  warehouseId: string;
  inventoryItemId: string;
  supplyId: {
    _id: string;
    name: string;
    unit: string;
  } | string;
  requestedQty: number;
  approvedQty?: number;
  carriedQty?: number;
  returnedQty?: number;
  status: TimelineSupplyStatus;
  claimedAt?: string;
  returnedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTimelineSuppliesFilter {
  timelineId: string;
}
