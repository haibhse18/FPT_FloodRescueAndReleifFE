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
      <div className="w-full h-64 bg-[#0f2a40] rounded-lg animate-pulse flex items-center justify-center text-gray-400">
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

  const fetchVehicles = async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await vehicleApi.getVehicles(
        `?page=${page}&limit=10&licensePlate=${keyword}`
      );
      setVehicles(res.data || []);
      setVehiclePage(res.meta?.page || 1);
      setVehicleTotalPages(res.meta?.totalPages || 1);
      setVehicleTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplies = async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await supplyApi.getSupplies(
        `?page=${page}&limit=10&name=${keyword}`
      );
      setSupplies(res.data || []);
      setSupplyPage(res.meta?.page || 1);
      setSupplyTotalPages(res.meta?.totalPages || 1);
      setSupplyTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await warehouseApi.getWarehouses(
        `?page=${page}&limit=10&name=${keyword}`
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

      //  format address đẹp
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

  // FIX: dùng warehouses thay vì locations và gọi tuần tự để tránh Rate Limit (429) hoặc bị huỷ Request.
  useEffect(() => {
    if (!warehouses.length) return;

    const fetchAddresses = async () => {
      for (const warehouse of warehouses) {
        const lat = warehouse.location?.coordinates?.[1];
        const lon = warehouse.location?.coordinates?.[0];

        if (!lat || !lon) continue;

        // tránh gọi lại API nhiều lần nếu đã có địa chỉ
        if (!warehouseAddresses[warehouse._id]) {
          await getAddressFromCoordinates(lat, lon, warehouse._id);
          // Thêm một khoảng nghỉ nhỏ 300ms giữa các lần gọi để OpenMap.vn không chặn do quá tải 
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    };

    fetchAddresses();
  }, [warehouses]);


  useEffect(() => {
    fetchVehicles(vehiclePage, vehicleKeyword);
  }, [vehiclePage, vehicleKeyword]);

  useEffect(() => {
    fetchSupplies(supplyPage, supplyKeyword);
  }, [supplyPage, supplyKeyword]);

  useEffect(() => {
    fetchWarehouses(warehousePage, warehouseKeyword);
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
        className="px-3 py-1 bg-white/10 rounded text-white disabled:opacity-40"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 rounded ${
            page === i + 1
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-white"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-white/10 rounded text-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );

  const Table = ({ columns, data }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading...</div>
      ) : (
        <table className="w-full text-sm text-white">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              {columns.map((c: any) => (
                <th key={c.key} className="px-4 py-3 text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className="border-t border-white/10 hover:bg-white/5">
                {columns.map((c: any) => (
                  <td key={c.key} className="px-4 py-3">
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Quản lý hệ thống
      </h1>

      {/* TABS */}
      <div className="flex gap-2 border-b border-white/10">
        {["Phương Tiện", "Vật Tư", "Kho"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-4 py-2 border-b-2 ${
              activeTab === t
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400"
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
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Tổng</p>
              <p className="text-xl text-white">{vehicleTotal}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <input
              value={vehicleKeyword}
              onChange={(e) => setVehicleKeyword(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
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
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Tổng</p>
              <p className="text-xl text-white">{supplyTotal}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <input
              value={supplyKeyword}
              onChange={(e) => setSupplyKeyword(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
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
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Kho</p>
              <p className="text-xl text-white">{warehouseTotal}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <input
              value={warehouseKeyword}
              onChange={(e) => setWarehouseKeyword(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
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

            <div className="bg-white/5 rounded-xl overflow-hidden">
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
              <div className="border-t border-white/10 p-4">
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {warehouses.length === 0 ? (
                    <p className="text-xs text-slate-500">Không có dữ liệu</p>
                  ) : (
                    warehouses.map((wh) => (
                      <div
                        key={wh._id}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                        <span className="text-sm text-slate-200">
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