import { comboSupplyApi } from "../infrastructure/comboSupply.api";

export class GetComboSuppliesUseCase {
  async execute(incidentType?: string) {
    return comboSupplyApi.getComboSupplies({ incidentType });
  }
}
