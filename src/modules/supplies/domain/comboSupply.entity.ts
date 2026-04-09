import { Supply } from "./supply.entity";

export interface ComboSupplyItem {
  supplyId: string | Supply;
  quantity: number;
}

export type IncidentType = "Flood" | "Trapped" | "Injured" | "Landslide" | "Other";

export interface ComboSupply {
  _id: string;
  name: string;
  incidentType: IncidentType;
  description: string;
  supplies: ComboSupplyItem[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
