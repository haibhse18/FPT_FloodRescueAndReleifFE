"use client";

import { useEffect, useState } from "react";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";
import { Table } from "@/shared/ui/components";
import { Button } from "@/shared/ui/components/Button";
import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";
import { vehicleRepository } from "@/modules/vehicles";
import { set } from "zod";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";
import { VehicleStatus } from "@/modules/vehicles/domain/vehicles.enity";
import { Upload } from "lucide-react";

const STATUS_MAP: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  IN_USE:         { label: "Đang sử dụng",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  MAINTENANCE:    { label: "Bảo trì",          color: "border border-gray-400    text-gray-400    bg-gray-400/10    rounded-full px-2 py-0.5" },
  OUT_OF_SERVICE: { label: "Ngưng hoạt động", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};

export default function VehiclePage() {

  const [allItems, setAllItems] = useState<Vehicle[]>([]);
  
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);


  
  const fetchVehicles = async (searchKeyword = "", pageNumber = 1) => {
  setLoading(true);

  try {
     const query =
  `?page=${pageNumber}&limit=10` +
  (searchKeyword ? `&licensePlate=${encodeURIComponent(searchKeyword)}|&type=${encodeURIComponent(searchKeyword)}|&brand=${encodeURIComponent(searchKeyword)}` : "");

    const res = await vehicleApi.getVehicles(query);

    setItems(res.data || []);
    setPage(res.meta?.page || 1);
    setTotalPages(res.meta?.totalPages || 1);

  } catch (error) {
    console.error("Fetch vehicles error:", error);
  } finally {
    setLoading(false);
  }

  const [ vehiclesRes] =
        await Promise.all([
          getVehiclesUseCase.execute(),
        ]);
      setVehiclesTotal(vehiclesRes?.total ?? 0);

};

  useEffect(() => {
    fetchVehicles(keyword, page);
  }, [page, keyword]);

  const handleSearch = () => {
  setPage(1);
  fetchVehicles(keyword, 1);
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
      render: (row: any) => {
              const s = STATUS_MAP[row.status as VehicleStatus];
              return s
                ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                : row.status;
            }
    },
  ];

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;

  setFile(selectedFile);
};

const handleImportExcel = async () => {
  if (!file) {
    alert("Vui lòng chọn file Excel");
    return;
  }

  try {
    await vehicleRepository.importExcel(file);

    alert("Import Excel thành công");

    fetchVehicles(); // reload table
  } catch (error) {
    console.error(error);
    alert("Import thất bại");
  }
};
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Danh sách phương tiện</h1>
          <p className="text-sm text-gray-500 mt-1">Có {vehiclesTotal} phương tiện trong hệ thống</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">

        {/* LEFT - Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm theo tên, ID hoặc loại..."
              className="w-full px-6 py-3 rounded-full bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-full bg-[#1A3263] hover:bg-[#1A3263]/80 text-white font-bold shadow-sm transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        {/* RIGHT - Import Excel */}
        <div className="flex items-center gap-3 w-full md:w-auto">

         <label className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors shadow-sm">
          <Upload className="w-5 h-5" />
          <span>Chọn file</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <span className="text-emerald-700 font-medium text-sm bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              {file.name}
            </span>
          )}

          <button
            onClick={handleImportExcel}
            disabled={!file}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50 transition-colors"
          >
            ⬆ Import
          </button>

        </div>

</div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl shadow-sm border border-gray-100">
          Không tìm thấy phương tiện nào
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
          <Table columns={columns} data={items} striped={true} hoverable={true} />
        </div>
      )}

      <div className="flex justify-center items-center gap-3 mt-6">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium shadow-sm"
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setPage(i + 1)}
      className={`w-10 h-10 rounded-full font-bold shadow-sm flex items-center justify-center transition-colors ${
        page === i + 1
          ? "bg-[#1A3263] text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium shadow-sm"
  >
    Next
  </button>

</div>
    </div>
  );
}