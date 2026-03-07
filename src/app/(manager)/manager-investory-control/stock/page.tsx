"use client";

import { useEffect, useState } from "react";
import { Button, Table } from "@/shared/ui/components";
import dynamic from "next/dynamic";
import { InventoryItem } from "@/modules/inventory/domain/inventory.entity";
import { inventoryApi } from "@/modules/inventory/infrastructure/inventory.api";
import { Warehouse } from "@/modules/inventory/domain/warehouse.entity";

// Dynamic import tránh SSR lỗi
const OpenMap = dynamic<any>(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  }
);

export default function SupplyStockPage() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // 🗺 Multiple warehouses
  const [warehouseLocations, setWarehouseLocations] = useState<
    {
      id: string;
      name: string;
      lat: number;
      lon: number;
    }[]
  >([]);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // =============================
  // FETCH INVENTORY
  // =============================
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await inventoryApi.getItems();
        setAllItems(data);
        setItems(data);
      } catch (err) {
        console.error("Không thể lấy dữ liệu tồn kho", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // =============================
  // FETCH ALL WAREHOUSES
  // =============================
  const fetchAllWarehouseLocations = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      if (!allItems.length) {
        throw new Error("Không có dữ liệu tồn kho");
      }

      const uniqueWarehouses = new Map<string, Warehouse>();

      allItems.forEach((item) => {
        if (item.warehouse && typeof item.warehouse !== "string") {
          const wh = item.warehouse as Warehouse;
          if (wh._id && !uniqueWarehouses.has(wh._id)) {
            uniqueWarehouses.set(wh._id, wh);
          }
        }
      });

      if (uniqueWarehouses.size === 0) {
        throw new Error("Không tìm thấy nhà kho nào");
      }

      const locations = Array.from(uniqueWarehouses.values())
        .filter((wh) => wh.location?.coordinates?.length === 2)
        .map((wh) => ({
          id: wh._id!,
          name: wh.name,
          lon: wh.location.coordinates[0], // longitude
          lat: wh.location.coordinates[1], // latitude
          
        }));

      if (!locations.length) {
        throw new Error("Không có tọa độ hợp lệ");
      }

      setWarehouseLocations(locations);
    } catch (err: any) {
      setLocationError(err?.message || "Lỗi lấy vị trí");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Auto load khi inventory có dữ liệu
  useEffect(() => {
    if (!loading && allItems.length > 0) {
      fetchAllWarehouseLocations();
    }
  }, [loading, allItems]);

  // =============================
  // SEARCH
  // =============================
  const handleSearch = () => {
    if (!keyword.trim()) {
      setItems(allItems);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const filtered = allItems.filter((item) => {
      const supplyName =
        typeof item.supplyID === "string"
          ? item.supplyID
          : item.supplyID?.name ?? "";

      const warehouseName =
        typeof item.warehouse === "string"
          ? item.warehouse
          : item.warehouse?.name ?? "";

      return (
        item.id.toLowerCase().includes(lowerKeyword) ||
        supplyName.toLowerCase().includes(lowerKeyword) ||
        warehouseName.toLowerCase().includes(lowerKeyword)
      );
    });

    setItems(filtered);
  };

  // =============================
  // TABLE
  // =============================
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên vật tư" },
    { key: "description", header: "Mô tả" },
    { key: "quantity", header: "Số lượng" },
    { key: "reservedQuantity", header: "Số lượng đã đặt" },
    { key: "unit", header: "Đơn vị" },
    { key: "warehouse", header: "Kho" },
    { key: "status", header: "Trạng thái" },
    { key: "lastUpdated", header: "Cập nhật" },
  ];

  const tableData = items.map((item) => ({
    ...item,
    name:
      typeof item.supplyID === "string"
        ? item.supplyID
        : item.supplyID?.name ?? "",
    unit:
      typeof item.supplyID === "string"
        ? ""
        : item.supplyID?.unit ?? "",
    warehouse:
      typeof item.warehouse === "string"
        ? item.warehouse
        : item.warehouse?.name ?? "",
    lastUpdated: new Date(item.lastUpdated).toLocaleString(),
  }));

  // =============================
  // UI
  // =============================
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Tồn kho vật tư
        </h1>
        <p className="text-gray-400">
          Quản lý kho vật tư ({items.length} mục)
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 max-w-2xl">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm theo tên, ID hoặc kho..."
          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSearch}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          Search
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-20 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg overflow-hidden text-white">
          <Table columns={columns} data={tableData} striped hoverable />
        </div>
      )}

      {/* MAP SECTION */}
      <div className="bg-slate-200 rounded-xl p-5 shadow-lg border-l-4 border-[#FF7700]">
        <div className="flex justify-between items-center mb-3">
         <Button
            onClick={fetchAllWarehouseLocations}
            disabled={isLoadingLocation}
            className="text-[#FF3535] text-sm font-bold uppercase"
          >
            {isLoadingLocation ? "Đang tải..." : "Cập nhật"}
          </Button>
        </div>

         {locationError && (
              <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{locationError}</span>
              </div>
            )}
            <p className="text-slate-800 text-lg font-bold mb-2">
              {isLoadingLocation ?
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                  Đang tải...
                </span>
                : `Tìm thấy ${warehouseLocations.length} nhà kho`}
            </p>
       {warehouseLocations.length > 0 && (
  <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner">
    <OpenMap
      warehouses={warehouseLocations.map((wh) => ({
        id: wh.id,
        name: wh.name,
        longitude: wh.lon,
        latitude: wh.lat,
      }))}
    />
  </div>
)}
      </div>
    </div>
  );
}