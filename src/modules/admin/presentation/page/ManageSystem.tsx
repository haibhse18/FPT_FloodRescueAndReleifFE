"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Vehicle, VehicleStatus } from "@/modules/vehicles/domain/vehicles.enity";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";

import { Supply, SupplyStatus } from "@/modules/supplies/domain/supply.entity";
import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";

import { Warehouse, WAREHOUSE_STATUS } from "@/modules/warehouse/domain/warehouse.entity";
import { warehouseApi } from "@/modules/warehouse/infrastructure/warehouse.api";

import { mapApi } from "@/modules/map/infrastructure/map.api";
import { GetLocationUseCase } from "@/modules/map/application/getLocation.usecase";
import { mapRepository  } from "@/modules/map/infrastructure/map.repository.impl";

// Tránh lỗi SSR với maplibre-gl
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-50 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 border border-gray-100">
        Đang tải bản đồ...
      </div>
    ),
  }
);

const getLocationUseCase = new GetLocationUseCase(mapRepository);

const STATUS_SUPPLIES: Record<SupplyStatus, { label: string; color: string }> = {
  SUBMITTED:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  CANCELLED:       { label: "Đã hủy",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  CLOSED:   { label: "Đã đóng", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};

const STATUS_VEHICLE: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  IN_USE:         { label: "Đang sử dụng",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  MAINTENANCE:    { label: "Bảo trì",          color: "border border-gray-400    text-gray-400    bg-gray-400/10    rounded-full px-2 py-0.5" },
  OUT_OF_SERVICE: { label: "Ngưng hoạt động", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};

const STATUS_WAREHOUSE: Record<WAREHOUSE_STATUS, { label: string; color: string }> = {
  FULL:         { label: "Đầy",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  EMPTY:         { label: "Trống",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  MAINTENANCE:    { label: "Bảo trì",          color: "border border-gray-400    text-gray-400    bg-gray-400/10    rounded-full px-2 py-0.5" },
};
export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState<
    "Phương Tiện" | "Vật Tư" | "Kho"
  >("Phương Tiện");

  const [loading, setLoading] = useState(true);

  // DATA
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  // SEARCH + PAGINATION
  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);

  const [supplyKeyword, setSupplyKeyword] = useState("");
  const [supplyPage, setSupplyPage] = useState(1);
  const [supplyTotalPages, setSupplyTotalPages] = useState(1);

  const [warehouseKeyword, setWarehouseKeyword] = useState("");
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseTotalPages, setWarehouseTotalPages] = useState(1);
  const [warehouseAddresses, setWarehouseAddresses] = useState<Record<string, string>>({});

  // STATS
  const [vehicleTotal, setVehicleTotal] = useState(0);
  const [supplyTotal, setSupplyTotal] = useState(0);
  const [warehouseTotal, setWarehouseTotal] = useState(0);

  // ================= FETCH =================

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getVehicles(
        `?page=${vehiclePage}&limit=10&licensePlate=${vehicleKeyword}`
      );
      setVehicles(res.data || []);
      setVehiclePage(res.meta?.page || 1);
      setVehicleTotalPages(res.meta?.totalPages || 1);
      setVehicleTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const res = await supplyApi.getSupplies(
        `?page=${supplyPage}&limit=10&name=${supplyKeyword}`
      );
      setSupplies(res.data || []);
      setSupplyPage(res.meta?.page || 1);
      setSupplyTotalPages(res.meta?.totalPages || 1);
      setSupplyTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseApi.getWarehouses(
        `?page=${warehousePage}&limit=10&address=${warehouseKeyword}`
      );
      setWarehouses(res.data || []);
      setWarehousePage(res.meta?.page || 1);
      setWarehouseTotalPages(res.meta?.totalPages || 1);
      setWarehouseTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };
 const getAddressFromCoordinates = async (
    lat: number,
    lon: number,
    warehouseId: string
  ) => {
    try {
      const location = await getLocationUseCase.getAddressFromCoordinates({
        latitude: lat,
        longitude: lon,
      });

      // ✅ format address đẹp
      const addr = location.address;

      const formatted = [
        addr.display,
      ]
        .filter(Boolean)
        .join(", ");

      setWarehouseAddresses((prev) => ({
        ...prev,
        [warehouseId]: formatted,
      }));
    } catch (err) {
      console.error("Lỗi lấy địa chỉ:", err);

      // fallback
      setWarehouseAddresses((prev) => ({
        ...prev,
        [warehouseId]: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      }));
    }
  };

  // FIX: dùng warehouses thay vì locations
  useEffect(() => {
    if (!warehouses.length) return;

    warehouses.forEach((warehouse) => {
      const lat = warehouse.location?.coordinates?.[1];
      const lon = warehouse.location?.coordinates?.[0];

      if (!lat || !lon) return;

      // tránh gọi lại API nhiều lần
      if (!warehouseAddresses[warehouse._id]) {
        getAddressFromCoordinates(lat, lon, warehouse._id);
      }
    });
  }, [warehouses]);


  useEffect(() => {
    fetchVehicles();
  }, [vehiclePage, vehicleKeyword]);

  useEffect(() => {
    fetchSupplies();
  }, [supplyPage, supplyKeyword]);

  useEffect(() => {
    fetchWarehouses();
  }, [warehousePage, warehouseKeyword]);

  

  // ================= UI COMPONENT =================

  const Pagination = ({
    page,
    totalPages,
    setPage,
  }: any) => (
    <div className="flex gap-2">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-white border border-gray-100 rounded-full text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm font-medium"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`w-10 h-10 rounded-full shadow-sm font-bold flex items-center justify-center ${
            page === i + 1
              ? "bg-emerald-700 text-white"
              : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-white border border-gray-100 rounded-full text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm font-medium"
      >
        Next
      </button>
    </div>
  );

  const Table = ({ columns, data }: any) => (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {loading ? (
        <div className="p-10 text-center text-gray-500 font-medium">Loading...</div>
      ) : (
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              {columns.map((c: any) => (
                <th key={c.key} className="px-6 py-4 text-left uppercase tracking-wider text-xs">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">
                {columns.map((c: any) => (
                  <td key={c.key} className="px-6 py-4 font-medium">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ================= RENDER =================

  return (
    <div className="p-2 space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Quản lý hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tổng quan kho, phương tiện và vật tư.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200">
        {["Phương Tiện", "Vật Tư", "Kho"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === t
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= VEHICLE ================= */}
      {activeTab === "Phương Tiện" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-emerald-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">
                <span>Tổng Phương Tiện</span>
              </p>
              <p className="text-4xl font-bold text-white relative z-10">{vehicleTotal}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <input
              value={vehicleKeyword}
              onChange={(e) => setVehicleKeyword(e.target.value)}
              className="px-6 py-3 w-80 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Tìm biển số..."
            />
            <Pagination
              page={vehiclePage}
              totalPages={vehicleTotalPages}
              setPage={setVehiclePage}
            />
          </div>

          <Table
            columns={[
              { key: "licensePlate", label: "Biển số" },
              { key: "type", label: "Loại" },
              { key: "brand", label: "Hãng" },
              { key: "status", label: "Trạng thái", render: (row: Vehicle) => {
                const s = STATUS_VEHICLE[row.status as VehicleStatus];
                return s
                  ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                  : row.status;
              } },
            ]}
            data={vehicles}
          />
        </>
      )}

      {/* ================= SUPPLY ================= */}
      {activeTab === "Vật Tư" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-emerald-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">
                <span>Tổng Vật Tư</span>
              </p>
              <p className="text-4xl font-bold text-white relative z-10">{supplyTotal}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <input
              value={supplyKeyword}
              onChange={(e) => setSupplyKeyword(e.target.value)}
              className="px-6 py-3 w-80 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Tìm vật tư..."
            />
            <Pagination
              page={supplyPage}
              totalPages={supplyTotalPages}
              setPage={setSupplyPage}
            />
          </div>

          <Table
            columns={[
              { key: "name", label: "Tên" },
              { key: "category", label: "Danh mục" },
              { key: "unit", label: "Đơn vị" },
              { key: "unitWeight", label: "Trọng lượng" },
              { key: "status", label: "Trạng thái", render: (row: Supply) => {
                          const s = STATUS_SUPPLIES[row.status as SupplyStatus];
                                 return s
                                   ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                                   : row.status;
                      },
                    },
            ]}
            data={supplies}
          />
        </>
      )}

      {/* ================= WAREHOUSE ================= */}
      {activeTab === "Kho" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-emerald-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">
                <span>Tổng Kho</span>
              </p>
              <p className="text-4xl font-bold text-white relative z-10">{warehouseTotal}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <input
              value={warehouseKeyword}
              onChange={(e) => setWarehouseKeyword(e.target.value)}
              className="px-6 py-3 w-80 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Tìm kho..."
            />
            <Pagination
              page={warehousePage}
              totalPages={warehouseTotalPages}
              setPage={setWarehousePage}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5">
            <Table
              columns={[
                { key: "name", label: "Tên kho" },
                { key: "location",
                  label: "Địa chỉ",
                  render: (row: Warehouse) => {
                    return warehouseAddresses[row._id] || "Đang tải...";
                  },
                },
                { key: "status", label: "Trạng thái", render: (row: Warehouse) => {
                  const s = STATUS_WAREHOUSE[row.status as WAREHOUSE_STATUS];
                  return s
                    ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                    : row.status;
                } },
              ]}
              data={warehouses}
            />

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <div className="h-[450px]">
                <OpenMap
                  warehouses={warehouses.map((w) => ({
                    id: w._id,
                    name: w.name,
                    longitude: w.location.coordinates[0],
                    latitude: w.location.coordinates[1],
                  }))}
                />
              </div>
              <div className="border-t border-gray-100 p-6">
                <div className="space-y-3 max-h-44 overflow-y-auto custom-scrollbar">
                  {warehouses.length === 0 ? (
                    <p className="text-sm text-gray-400 font-medium">Không có dữ liệu bản đồ</p>
                  ) : (
                    warehouses.map((wh) => (
                      <div
                        key={wh._id}
                        className="flex items-center gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 px-4 py-3 rounded-2xl transition-colors">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0" />
                        <span className="text-sm font-bold text-gray-900">
                          {wh.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}