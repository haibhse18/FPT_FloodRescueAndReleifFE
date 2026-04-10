import { Supply } from "./supply.entity";

export interface ComboSupplyItem {
  supplyId: string | Supply;
  quantity: number;
}

export type ComboSupplyType = "Citizen" | "Rescue Team";

export type ComboGroupKey = "adult" | "child" | "elderly" | "injured";

export interface ComboSupply {
  _id: string;
  name: string;
  type: ComboSupplyType;
  /** Group key để map với nhóm thành viên gia đình (adult, child, elderly, injured) */
  groupKey?: ComboGroupKey | null;
  description: string;
  supplies: ComboSupplyItem[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
