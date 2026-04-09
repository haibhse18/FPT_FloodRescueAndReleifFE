
// statuses mirror backend SUPPLY_STATUS
export type VehicleStatus =
  | 'ACTIVE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export type VehicleType =
  | 'AMBULANCE'
  | "RESCUE_BOAT"
  | "FIRE_TRUCK"
  | "TRUCK"
  | "VAN"
  | "MOTORCYCLE"
  | "OTHERS";

export type VehicleCapacityUnit = "Người" | "LITERS" | "TONS" | "KG"; // KG for weight, CBM for volume
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}
export interface Team {
  _id: string
  name: string
}
export interface Mission {
  _id: string
  name: string
}

export interface Vehicle {
  _id: string;
  name: string;
  licensePlate: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  capacityUnit: VehicleCapacityUnit;
  status: VehicleStatus;
  assignedTo?: Team | string; // có thể là ID hoặc object team
  currentMission?: Mission | string; // có thể là ID hoặc object mission
  lastMaintenanceDate?: Date;
  location?: GeoPoint; // sửa ở đây
  description: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}