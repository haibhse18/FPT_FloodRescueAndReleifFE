import { apiClient } from "@/services/apiClient";
import { authSession } from "@/services/authSession";
import type { ApiResponse } from "@/shared/types/api";
import { ComboSupply } from "../domain/comboSupply.entity";

export const comboSupplyApi = {
    getComboSupplies: async (params?: { incidentType?: string }): Promise<ApiResponse<ComboSupply[]>> => {
        const queryParams = new URLSearchParams();
        if (params?.incidentType) {
            queryParams.append("incidentType", params.incidentType);
        }
        const query = queryParams.toString();
        const endpoint = query ? `/combo-supplies?${query}` : `/combo-supplies`;

        return apiClient.get(endpoint, {
            headers: authSession.getAuthHeaders(),
        });
    },

    getComboSupplyDetail: async (id: string): Promise<ApiResponse<ComboSupply>> => {
        return apiClient.get(`/combo-supplies/${id}`, {
            headers: authSession.getAuthHeaders(),
        });
    },
};
