"use client";

import { useEffect, useState } from "react";
import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";
import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";
import { VehicleList } from "../components/VehicleList";
import { useToast } from "@/hooks/use-toast";

const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);

export default function VehiclesManagementPage() {

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const fetchVehicles = async () => {
    setLoading(true);

    try {
      const data = await getVehiclesUseCase.execute();
      setVehicles(data.vehicles);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách xe";

      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          🚑 Quản lý phương tiện
        </h1>

        <p className="text-gray-400">
          Quản lý danh sách phương tiện cứu hộ
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-6">

        <VehicleList
          vehicles={vehicles}
          loading={loading}
        />

      </div>

    </div>
  );
}