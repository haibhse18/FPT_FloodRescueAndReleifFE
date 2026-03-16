import { Vehicle, VehicleStatus } from "../domain/vehicles.enity";
import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { uploadFile } from "../../../services/uploadFile";

/**
 * Vehicle API methods
 */
export const vehicleApi = {


  getVehicles: async (query?: string) => {
    try {
      const response = await axiosInstance.get(
        "/vehicles/list" + (query || "")
      );

      return response.data; 
      // { data: Vehicle[], meta: { page, totalPages, limit, total } }

    } catch (error) {
      console.error("[VehicleAPI] Error fetching vehicles:", error);
      return { data: [], meta: { page: 1, totalPages: 1 } };
    }
  },

  createVehicle: async (data: Partial<Vehicle>) => {
    const response = await axiosInstance.post<ApiResponse<Vehicle>>("/vehicles", data);
    return response.data;
  },

  updateVehicleStatus: async (id: string, status: VehicleStatus) => {
    await axiosInstance.patch(`/vehicles/${id}/status`, { status });
  },

    /**
       * POST /api/vehicles/import
       * Import vehicles from Excel
       */
     importExcel: async (file: File) => {
    const response = await uploadFile<ApiResponse<{message:string,total:number}>>(
      "/vehicles/import",
      file
    );

    return response.data;
  },

};