/**
 * TimelineVehicle Entity - Domain layer
 * Represents vehicles reserved/claimed by a team for a specific timeline
 */

export type TimelineVehicleStatus =
  | "RESERVED"
  | "APPROVED"
  | "REJECTED"
  | "CLAIMED"
  | "RETURNED";

export interface TimelineVehicle {
  _id: string;
  timelineId: string;
  vehicleId: {
    _id: string;
    name: string;
    type: string;
    licensePlate?: string;
  } | string;
  warehouseId: string;
  inventoryItemId: string;
  status: TimelineVehicleStatus;
  claimedAt?: string;
  returnedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTimelineVehiclesFilter {
  timelineId: string;
}
