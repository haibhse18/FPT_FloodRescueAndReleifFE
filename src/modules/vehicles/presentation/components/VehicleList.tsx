"use client";

import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";
import { Table } from "@/shared/ui/components";

interface VehicleListProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

export function VehicleList({ vehicles, loading = false }: VehicleListProps) {
  const columns = [
    {
      key: "licensePlate",
      header: "Biển số",
      render: (row: Vehicle) => row.licensePlate ?? "-"
    },

    {
      key: "vehicle",
      header: "Xe",
      render: (row: Vehicle) =>
        `${row.brand ?? ""} ${row.model ?? ""}`.trim() || "-"
    },

    {
      key: "type",
      header: "Loại",
      render: (row: Vehicle) => row.type ?? "-"
    },

    {
      key: "capacity",
      header: "Tải trọng",
      render: (row: Vehicle) =>
        row.capacity ? `${row.capacity} ${row.capacityUnit ?? ""}` : "-"
    },

    {
      key: "status",
      header: "Trạng thái",
      render: (row: Vehicle) => {
        const statusMap: Record<string, string> = {
          ACTIVE: "🟢 Hoạt động",
          MAINTENANCE: "🟡 Bảo trì",
          INACTIVE: "⚪ Không dùng",
          OUT_OF_SERVICE: "🔴 Hỏng"
        };

        return statusMap[row.status] || row.status || "-";
      }
    },

    {
      key: "assignedTo",
      header: "Đội",
      render: (row: Vehicle) => row.assignedTo ?? "-"
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-20 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        Không có phương tiện
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden text-white">
      <Table columns={columns} data={vehicles} striped hoverable />
    </div>
  );
}