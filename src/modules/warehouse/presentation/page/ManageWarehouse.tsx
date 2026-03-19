"use client";

import { useEffect, useState } from "react";
import { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import { GetWarehouseUseCase  } from "@/modules/warehouse/application/getWarehouse.usecase";
import { WarehouseList } from "../components/WarehouseList";
import { useToast } from "@/hooks/use-toast";

const getWarehousesUseCase = new GetWarehouseUseCase (warehouseRepository);

export default function VehiclesManagementPage() {

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const fetchWarehouses = async () => {
    setLoading(true);

    try {
      const data = await getWarehousesUseCase.execute();
      setWarehouses(data.warehouses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách kho";

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
    fetchWarehouses();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          🚑 Quản lý kho
        </h1>

        <p className="text-gray-400">
          Quản lý danh sách kho cứu hộ
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-6">

        <WarehouseList
          warehouses={warehouses}
          loading={loading}
        />

      </div>

    </div>
  );
}