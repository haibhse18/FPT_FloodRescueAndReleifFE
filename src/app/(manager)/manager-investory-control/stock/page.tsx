"use client";

import { useEffect, useState } from "react";
import { Button, Table } from "@/shared/ui/components";
import dynamic from "next/dynamic";

import { InventoryItem } from "@/modules/inventory/domain/inventory.entity";
import { inventoryApi } from "@/modules/inventory/infrastructure/inventory.api";
import { Warehouse } from "@/modules/inventory/domain/warehouse.entity";

// tránh lỗi SSR
const OpenMap = dynamic(
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

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // warehouse locations
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

  // ================================
  // FETCH INVENTORY
  // ================================
  const fetchInventory = async (searchKeyword = "", pageNumber = 1) => {

    setLoading(true);

    try {

      const query =
        `?page=${pageNumber}&limit=10` +
        (searchKeyword ? `&supplyName=${encodeURIComponent(searchKeyword)}` : "");

      const res = await inventoryApi.getItems(query);

      const data = res.data || [];

      setItems(data);
      setAllItems(data);

      setPage(res.meta?.page || 1);
      setTotalPages(res.meta?.totalPages || 1);

    } catch (err) {

      console.error("Không thể lấy dữ liệu tồn kho", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchInventory(keyword, page);
  }, [page, keyword]);

  // ================================
  // SEARCH
  // ================================
  const handleSearch = () => {
    setPage(1);
    fetchInventory(keyword, 1);
  };

  // ================================
  // FETCH WAREHOUSE LOCATION
  // ================================
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

      const locations = Array.from(uniqueWarehouses.values())
        .filter((wh) => wh.location?.coordinates?.length === 2)
        .map((wh) => ({
          id: wh._id!,
          name: wh.name,
          lon: wh.location.coordinates[0],
          lat: wh.location.coordinates[1],
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

  useEffect(() => {

    if (!loading && allItems.length > 0) {
      fetchAllWarehouseLocations();
    }

  }, [loading, allItems]);

  // ================================
  // TABLE
  // ================================
  const columns = [

    { key: "name", header: "Tên vật tư" },
    { key: "description", header: "Mô tả" },
    { key: "quantity", header: "Số lượng" },
    { key: "reservedQuantity", header: "Đã đặt" },
    { key: "unit", header: "Đơn vị" },
    { key: "warehouse", header: "Kho" },

    {
      key: "status",
      header: "Trạng thái",
      render: (row: InventoryItem) => {

        const statusMap: Record<string, string> = {
          ACTIVE: "🟢 Sẵn sàng",
          OUT_OF_STOCK: "🔴 Hết hàng",
          RESERVED: "🟡 Đã đặt",
        };

        return statusMap[row.status] || row.status || "-";

      },
    },

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

  // ================================
  // UI
  // ================================
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
          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
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
          <Table columns={columns} data={tableData as any[]} striped hoverable />
        </div>

      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2">

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
          className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
        >
          Next
        </button>

      </div>

      {/* MAP */}
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

          <div className="text-xs text-red-600 mb-2">
            ⚠️ {locationError}
          </div>

        )}

        <p className="text-slate-800 text-lg font-bold mb-2">

          {isLoadingLocation
            ? "Đang tải..."
            : `Tìm thấy ${warehouseLocations.length} nhà kho`}

        </p>

        {warehouseLocations.length > 0 && (

          <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-slate-300">

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