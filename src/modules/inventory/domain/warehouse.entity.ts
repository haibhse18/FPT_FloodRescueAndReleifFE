export enum WAREHOUSE_STATUS {
  FULL = "FULL",
  EMPTY = "EMPTY",
  MAINTENANCE = "MAINTENANCE",
}

export interface WarehouseLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Warehouse {
  _id?: string;
  name: string;
  location: WarehouseLocation;
  status: WAREHOUSE_STATUS;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWarehouseDTO {
  name: string;
  location: WarehouseLocation;
  status?: WAREHOUSE_STATUS;
}

export interface UpdateWarehouseDTO {
  name?: string;
  location?: WarehouseLocation;
  status?: WAREHOUSE_STATUS;
}
