"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Table } from "@/shared/ui/components";
import { InventoryItem } from "@/modules/inventory/domain/inventory.entity";
import { inventoryApi } from "@/modules/inventory/infrastructure/inventory.api";
import { Warehouse } from "@/modules/inventory/domain/warehouse.entity";

// MAP
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  { ssr: false }
);

export default function SupplyStockPage() {

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [warehouseLocations, setWarehouseLocations] = useState<
    { id: string; name: string; lat: number; lon: number }[]
  >([]);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // ===============================
  // IMPORT EXCEL
  // ===============================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleImportExcel = async () => {
    if (!file) return;

    try {
      await inventoryApi.importExcel(file);
      alert("Import thành công");
      fetchInventory();
    } catch (err) {
      alert("Import thất bại");
    }
  };

  // ===============================
  // FETCH INVENTORY
  // ===============================

  const fetchInventory = async (searchKeyword = "", pageNumber = 1) => {

    setLoading(true);

    try {

      const query =
        `?page=${pageNumber}&limit=10` +
        (searchKeyword ? `&supplyName=${searchKeyword}` : "");

      const res = await inventoryApi.getItems(query);

      const data = res.data || [];

      setItems(data);
      setAllItems(data);

      setPage(res.meta?.page || 1);
      setTotalPages(res.meta?.totalPages || 1);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchInventory(keyword, page);
  }, [page, keyword]);

  // ===============================
  // FETCH WAREHOUSE LOCATION
  // ===============================

  const fetchWarehouseLocations = async () => {

    setIsLoadingLocation(true);

    try {

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

      setWarehouseLocations(locations);

    } catch (err) {

      console.error(err);

    } finally {

      setIsLoadingLocation(false);

    }
  };

  useEffect(() => {
    if (!loading) fetchWarehouseLocations();
  }, [loading]);

  // ===============================
  // TABLE COLUMNS
  // ===============================

  const columns = [
    { key: "name", header: "Tên vật tư" },
    { key: "quantity", header: "Số lượng" },
    { key: "reservedQuantity", header: "Đã đặt" },
    { key: "unit", header: "Đơn vị" },
    { key: "warehouse", header: "Kho" },
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

  // ===============================
  // STATS
  // ===============================

  const totalItems = items.length;

  const activeItems = items.filter((i) => i.status === "ACTIVE").length;

  const reservedItems = items.filter((i) => i.status === "RESERVED").length;

  // ===============================
  // UI
  // ===============================

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          🏭 Tồn kho vật tư
        </h1>
        <p className="text-slate-400 text-sm">
          Quản lý vật tư trong kho
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400">Vật tư</p>
          <p className="text-xl font-bold text-white">
            {totalItems}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400">Kho</p>
          <p className="text-xl font-bold text-orange-400">
            {warehouseLocations.length}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400">Sẵn sàng</p>
          <p className="text-xl font-bold text-emerald-400">
            {activeItems}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400">Đã đặt</p>
          <p className="text-xl font-bold text-amber-400">
            {reservedItems}
          </p>
        </div>

      </div>

      {/* SEARCH + IMPORT */}

      <div className="flex flex-wrap justify-between gap-3">

        <div className="flex gap-2">

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm vật tư..."
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />

          <button
            onClick={() => fetchInventory(keyword, 1)}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm"
          >
            Tìm
          </button>

        </div>

        <div className="flex gap-2">

          <label className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-sm text-white">
            📁 Chọn file
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            onClick={handleImportExcel}
            className="px-4 py-2 bg-emerald-600 rounded-lg text-sm"
          >
            Import
          </button>

        </div>

      </div>

      {/* MAIN LAYOUT */}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">

        {/* TABLE */}

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden text-white">

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading...
            </div>
          ) : (
            <Table columns={columns} data={tableData as any[]} />
          )}

        </div>

        {/* MAP */}

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

          <div className="h-[450px]">

            <OpenMap
              warehouses={warehouseLocations.map((wh) => ({
                id: wh.id,
                name: wh.name,
                longitude: wh.lon,
                latitude: wh.lat,
              }))}
            />

          </div>

          {/* WAREHOUSE LIST */}

          <div className="border-t border-white/10 p-4">

            <p className="text-sm text-slate-300 font-semibold mb-3">
              Danh sách kho
            </p>

            <div className="space-y-2 max-h-44 overflow-y-auto">

              {warehouseLocations.map((wh) => (

                <div
                  key={wh.id}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
                >

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <span className="text-sm text-slate-200">
                      {wh.name}
                    </span>
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}