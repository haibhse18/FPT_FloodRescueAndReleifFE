"use client";

import { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import { Table } from "@/shared/ui/components";

interface WarehouseListProps {
  warehouses: Warehouse[];
  loading?: boolean;
}

export function WarehouseList({ warehouses, loading = false }: WarehouseListProps) {
  const columns = [
    {
      key: "name",
      header: "Tên kho",
      render: (row: Warehouse) => row.name ?? "-"
    },

    {
      key: "location",
      header: "Địa chỉ",
      render: (row: Warehouse) =>
        `${row.location ?? ""}`.trim() || "-"
    },

    {
      key: "status",
      header: "Trạng thái",
      render: (row: Warehouse) => {
        const statusMap: Record<string, string> = {
          FULL: "🟢 Đầy",
          MAINTENANCE: "🟡 Bảo trì",
          EMTY: "🔴 Trống"
        };

        return statusMap[row.status] || row.status || "-";
      }
    },

  ];

  if (loading) {
    return (
      <div className="text-center py-20 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        Không có kho
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden text-white">
      <Table columns={columns} data={warehouses} striped hoverable />
    </div>
  );
}