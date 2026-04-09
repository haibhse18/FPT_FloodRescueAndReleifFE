import { comboSupplyApi } from "../infrastructure/comboSupply.api";

export class GetComboSuppliesUseCase {
  async execute(type?: string) {
    return comboSupplyApi.getComboSupplies({ type });
  }
}
