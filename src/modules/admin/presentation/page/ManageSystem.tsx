"use client";

import { useEffect, useState } from "react";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory.repository.impl";
import { GetWarehousesUseCase } from "@/modules/inventory/application/getWarehouses.usecase";
import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";
import { Supply } from "@/modules/supplies/domain/supply.entity";
import { Warehouse } from "@/modules/inventory/domain/warehouse.entity";
import { mapApi } from "@/modules/map/infrastructure/map.api";
import { GetLocationUseCase } from "@/modules/map/application/getLocation.usecase";
import { mapRepository  } from "@/modules/map/infrastructure/map.repository.impl";
import dynamic from "next/dynamic";

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
const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
const getWarehousesUseCase = new GetWarehousesUseCase(inventoryRepository);
const getLocationUseCase = new GetLocationUseCase(mapRepository);


export default function AdminSystemPage() {
  const [activeMainTab, setActiveMainTab] = useState<"categories" | "params">("categories");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"vehicles" | "supplies" | "locations">("vehicles");
  const [warehouseAddresses, setWarehouseAddresses] = useState<Record<string, string>>({});

  // Search & pagination per tab
  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);

  const [supplyKeyword, setSupplyKeyword] = useState("");
  const [supplyPage, setSupplyPage] = useState(1);
  const [supplyTotalPages, setSupplyTotalPages] = useState(1);

  const [locationKeyword, setLocationKeyword] = useState("");
  const [locationPage, setLocationPage] = useState(1);
  const [locationTotalPages, setLocationTotalPages] = useState(1);

  const PAGE_SIZE = 10;

  // API Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [locations, setLocations] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliesRes, vehiclesRes, locationsRes] = await Promise.all([
        getSuppliesUseCase.execute().catch(e => { console.error("Supply API failed:", e); return []; }),
        getVehiclesUseCase.execute().catch(e => { console.error("Vehicle API failed:", e); return { vehicles: [], total: 0 }; }),
        getWarehousesUseCase.execute().catch(e => { console.error("Warehouse API failed:", e); return []; }),
      ]);

      if (!suppliesRes?.length) console.warn("No supplies fetched - check if backend /supply/list is working or if token is missing.");
      if (!vehiclesRes?.vehicles?.length) console.warn("No vehicles fetched - check if backend /vehicles/list is working or if token is missing.");

      setSupplies(suppliesRes || []);
      setVehicles(vehiclesRes.vehicles || []);
      setLocations(locationsRes || []);
    } catch (err) {
      console.error("Error fetching admin system data:", err);
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
      longitude: lon
    });

    setWarehouseAddresses((prev) => ({
      ...prev,
      [warehouseId]: location.address.display
    }));
  } catch (err) {
    console.error("Lỗi lấy địa chỉ:", err);
    // Fallback to coordinates if reverse geocoding fails
    setWarehouseAddresses((prev) => ({
      ...prev,
      [warehouseId]: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }));
  }
};

  // 📍 Khi locations load thì convert địa chỉ
  useEffect(() => {
  if (!locations.length) return;

  locations.forEach((warehouse) => {
    const lat = warehouse.location?.coordinates?.[1];
    const lon = warehouse.location?.coordinates?.[0];

    if (!lat || !lon) return;

    if (!warehouseAddresses[warehouse._id]) {
      getAddressFromCoordinates(lat, lon, warehouse._id);
    }
  });

}, [locations]);
  useEffect(() => {
    fetchData();
  }, []);

  // System Params State
  const [systemParams, setSystemParams] = useState({
    maxVehiclesPerTask: 5,
    minSupplyStockWarning: 100,
    searchRadiusKm: 50,
    maxResponseTimeHours: 2,
    autoAssignTeams: true,
  });

  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const renderCategoryTable = (
    data: any[],
    title: string,
    columns: { key: string; label: string; renderer?: (val: any, item?: any) => React.ReactNode }[],
    keyword: string,
    setKeyword: (v: string) => void,
    page: number,
    setPage: (v: number) => void,
  ) => {
    const filtered = data.filter((item) =>
      Object.values(item).some((v) =>
        String(v ?? "").toLowerCase().includes(keyword.toLowerCase())
      )
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
    <div className="bg-[#1a3a54] rounded-xl border border-gray-700/50 overflow-hidden shadow-xl mt-4">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Danh mục {title}</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
          + Thêm {title.toLowerCase()}
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-4 border-b border-gray-700/50 flex items-center gap-3">
        <div className="relative w-80">
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setPage(1)}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Search
        </button>
        {keyword && (
          <button
            onClick={() => { setKeyword(""); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm"
          >
            ✕ Xóa
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">{filtered.length} kết quả</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f2a40] text-gray-400 text-sm tracking-wider border-b border-gray-700/50">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-medium">{col.label}</th>
              ))}
              <th className="px-6 py-3 font-medium w-32 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-400">
                  Không tìm thấy dữ liệu.
                </td>
              </tr>
            ) : (
              paged.map((item, idx) => (
                <tr key={item._id || item.id || item.licensePlate || idx} className="hover:bg-white/5 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-3 font-medium text-white">
                      {col.renderer ? col.renderer(item[col.key], item) : item[col.key] || "-"}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-blue-400 mx-1 transition-colors">✏️</button>
                    <button className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-700/50">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : "bg-white/10 text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
  };

  const vehicleColumns = [
    { key: "licensePlate", label: "Biển số / Mã" },
    { key: "type", label: "Loại" },
    { key: "brand", label: "Nhãn hiệu" },
    { key: "capacity", label: "Sức chứa", renderer: (val: any, item: any) => `${val || "-"} ${item.capacityUnit || ""}` },
    { key: "status", label: "Trạng thái", renderer: (val: any) => (
      <span className={`px-2 py-1 rounded text-xs ${val === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : val === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
        {val}
      </span>
    ) }
  ];

  const supplyColumns = [
    { key: "name", label: "Tên vật tư" },
    { key: "category", label: "Danh mục" },
    { key: "unit", label: "Đơn vị tính" },
    { key: "unitWeight", label: "Khối lượng (kg)" },
    { key: "status", label: "Trạng thái", renderer: (val: any) => (
      <span className={`px-2 py-1 rounded text-xs ${val === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
        {val}
      </span>
    ) }
  ];

  const locationColumns = [
    { key: "name", label: "Tên Kho" },
   {
    key: "location",
    label: "Địa chỉ",
   renderer: (_: any, item: Warehouse) => (
  <div>
    {warehouseAddresses[item._id] || "Đang lấy địa chỉ..."}
  </div>
)
  },

    { key: "status", label: "Trạng thái Kho", renderer: (val: any) => (
      <span className={`px-2 py-1 rounded text-xs ${val === 'FULL' ? 'bg-blue-500/20 text-blue-400' : val === 'EMPTY' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
        {val || "UNKNOWN"}
      </span>
    ) }
  ];

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Cấu hình Hệ thống</h1>

      {/* Main Tabs */}
      <div className="flex space-x-1 bg-[#1a3a54] p-1 rounded-xl mb-6 w-fit border border-gray-700/50">
        <button
          onClick={() => setActiveMainTab("categories")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeMainTab === "categories"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          🗂️ Quản lý Danh mục
        </button>
        <button
          onClick={() => setActiveMainTab("params")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeMainTab === "params"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          ⚙️ Tham số Hệ thống
        </button>
      </div>

      {activeMainTab === "categories" && (
        <div className="animate-fade-in">
          {/* Sub Tabs for Categories */}
          <div className="flex border-b border-gray-700/50 mb-6 uppercase text-sm font-semibold tracking-wider">
            <button
              onClick={() => setActiveCategoryTab("vehicles")}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeCategoryTab === "vehicles" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Phương tiện
            </button>
            <button
              onClick={() => setActiveCategoryTab("supplies")}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeCategoryTab === "supplies" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Hàng cứu trợ
            </button>
            <button
              onClick={() => setActiveCategoryTab("locations")}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeCategoryTab === "locations" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Kho hàng / Trạm
            </button>
          </div>

          {activeCategoryTab === "vehicles" && renderCategoryTable(vehicles, "Phương tiện", vehicleColumns, vehicleKeyword, setVehicleKeyword, vehiclePage, setVehiclePage)}
          {activeCategoryTab === "supplies" && renderCategoryTable(supplies, "Hàng cứu trợ", supplyColumns, supplyKeyword, setSupplyKeyword, supplyPage, setSupplyPage)}
          {activeCategoryTab === "locations" && (
            <>
              {renderCategoryTable(locations, "Kho hàng / Trạm", locationColumns, locationKeyword, setLocationKeyword, locationPage, setLocationPage)}

              {/* Bản đồ kho hàng */}
              {locations.length > 0 && (
                <div className="bg-[#1a3a54] rounded-xl border border-gray-700/50 overflow-hidden shadow-xl mt-4">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">🗺️ Bản đồ vị trí Kho hàng</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Hiển thị {locations.filter(l => l.location?.coordinates?.length === 2).length} kho có tọa độ</p>
                  </div>
                  <div className="p-4">
                    <OpenMap
                      warehouses={locations
                        .filter((w) => w.location?.coordinates?.length === 2)
                        .map((w) => ({
                          id: w._id,
                          name: w.name,
                          longitude: w.location.coordinates[0],
                          latitude: w.location.coordinates[1],
                        }))}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeMainTab === "params" && (
        <div className="bg-[#1a3a54] rounded-xl border border-gray-700/50 p-6 shadow-xl max-w-3xl animate-fade-in">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-gray-700/50 pb-4">Cài đặt Tham số Hoạt động</h2>
          
          <form onSubmit={handleSaveParams} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Số lượng phương tiện tối đa / Nhiệm vụ
                </label>
                <input
                  type="number"
                  value={systemParams.maxVehiclesPerTask}
                  onChange={(e) => setSystemParams({...systemParams, maxVehiclesPerTask: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2232] border border-gray-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Giới hạn phương tiện điều động cho một nhiệm vụ khẩn cấp.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mức tồn kho cảnh báo tối thiểu (Đơn vị)
                </label>
                <input
                  type="number"
                  value={systemParams.minSupplyStockWarning}
                  onChange={(e) => setSystemParams({...systemParams, minSupplyStockWarning: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2232] border border-gray-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Hệ thống sẽ cảnh báo khi số lượng hàng cứu trợ dưới mức này.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Bán kính tìm kiếm đội cứu hộ (km)
                </label>
                <input
                  type="number"
                  value={systemParams.searchRadiusKm}
                  onChange={(e) => setSystemParams({...systemParams, searchRadiusKm: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2232] border border-gray-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Khoảng cách tối đa quét tìm đội tự do gần khu vực sự cố.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Thời gian phản hồi tiêu chuẩn (Giờ)
                </label>
                <input
                  type="number"
                  value={systemParams.maxResponseTimeHours}
                  onChange={(e) => setSystemParams({...systemParams, maxResponseTimeHours: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2232] border border-gray-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Được dùng để đo lường KPI hiệu suất của các đội cứu hộ.</p>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-700/50 flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={systemParams.autoAssignTeams}
                    onChange={(e) => setSystemParams({...systemParams, autoAssignTeams: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${systemParams.autoAssignTeams ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${systemParams.autoAssignTeams ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-white font-medium">Tự động đề xuất phân công đội (AI)</div>
              </label>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-colors"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {isToastVisible && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-green-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3 z-50">
          <span className="text-green-400">✅</span> Lưu tham số hệ thống thành công!
        </div>
      )}
    </div>
  );
}
