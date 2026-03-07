import { Vehicle, VehicleStatus } from "../domain/vehicles.enity";
import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types";

export const vehicleApi = {

  getVehicles: async (query?: string): Promise<Vehicle[]> => {
    try {
        const response = await axiosInstance.get<ApiResponse<Vehicle[]>>(
            '/vehicles/list' + (query || '')
        );
        const data = response.data?.data;
        if (!Array.isArray(data)) {
            console.warn('[VehicleAPI] Data is not array. Full response:', response.data);
            return [];
        }
        return data;
    } catch (error) {
        console.error('[VehicleAPI] Error fetching vehicles:', error);
        return []; // 👈 không throw nữa
    }
    },

  // createVehicle: async (data: CreateSupplyRequestData): Promise<SupplyRequest> => {
  //       const response = await axiosInstance.post<ApiResponse<SupplyRequest>>(
  //           '/supply/requests',
  //           data
  //       );
  //       if (!response.data.data) {
  //           throw new Error('Không nhận được dữ liệu phản hồi');
  //       }
  //       return response.data.data;

  // updateVehicle: async (
  //   id: string,
  //   data: Partial<Vehicle>
  // ): Promise<Vehicle> => {
  //   const res = await axiosInstance.patch<ApiResponse<Vehicle>>(
  //     `/vehicles/${id}`,
  //     data
  //   );

  //   return res.data.data;
  // },

  // updateVehicleStatus: async (
  //   id: string,
  //   status: VehicleStatus
  // ) => {
  //   await axiosInstance.patch(`/vehicles/${id}/status`, { status });
  // },

  // deleteVehicle: async (id: string) => {
  //   await axiosInstance.delete(`/vehicles/${id}`);
  // },
};