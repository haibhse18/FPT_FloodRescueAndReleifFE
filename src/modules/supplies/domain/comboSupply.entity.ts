import { Supply } from "./supply.entity";

export interface ComboSupplyItem {
  supplyId: string | Supply;
  quantity: number;
}

export type ComboSupplyType = "Citizen" | "Rescue Team";

export interface ComboSupply {
  _id: string;
  name: string;
  type: ComboSupplyType;
  description: string;
  supplies: ComboSupplyItem[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
