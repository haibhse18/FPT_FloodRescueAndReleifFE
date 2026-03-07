"use client";

import { useEffect, useState } from "react";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";
import { Table } from "@/shared/ui/components";
import { Button } from "@/shared/ui/components/Button";
import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";

export default function VehiclePage() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchVehicles = async (searchKeyword = "") => {
    setLoading(true);
    try {
      const query = searchKeyword
        ? `?keyword=${encodeURIComponent(searchKeyword)}`
        : "";

      const data = await vehicleApi.getVehicles(query);

      // đảm bảo luôn là array
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearch = () => fetchVehicles(keyword);

  const handleClear = () => {
    setKeyword("");
    fetchVehicles();
  };

  const columns = [
    {
      key: "licensePlate",
      header: "Biển số",
      render: (row: Vehicle) => row.licensePlate ?? "-"
    },
    {
      key: "vehicle",
      header: "Xe",
      render: (row: Vehicle) => `${row.brand ?? ""} ${row.model ?? ""}`
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
        row.capacity  ??"-"
    },
    {
      key: "capacityUnit",
      header: "Đơn vị tải trọng",
      render: (row: Vehicle) => row.capacityUnit ?? "-"
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
  render: (row: Vehicle) =>
    typeof row.assignedTo === "object"
      ? row.assignedTo?.name
      : row.assignedTo || "-"
}
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Danh sách phương tiện
        </h1>
        <p className="text-gray-400">Có {items.length} phương tiện</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 max-w-2xl">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm theo tên, ID hoặc loại..."
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

         <button
    onClick={handleSearch}
    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-md"
  >
    Search
  </button>

      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-white bg-white/5 rounded-lg">
          Không tìm thấy phương tiện nào
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg overflow-hidden text-white">
          <Table columns={columns} data={items} striped hoverable />
        </div>
      )}
    </div>
  );
}