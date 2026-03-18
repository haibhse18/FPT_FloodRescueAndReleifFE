"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Table } from "@/shared/ui/components";
import { InventoryItem } from "@/modules/inventory/domain/inventory.entity";
import { inventoryApi } from "@/modules/inventory/infrastructure/inventory.api";
import { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import { warehouseApi } from "@/modules/warehouse/infrastructure/warehouse.api";
import { VehicleStatus } from "@/modules/vehicles/domain/vehicles.enity";
import { InventoryStatus } from "@/modules/inventory/domain/inventory.entity";
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  { ssr: false }
);

const STATUS_MAP: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  IN_USE:         { label: "Đang sử dụng",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  MAINTENANCE:    { label: "Bảo trì",          color: "border border-gray-400    text-gray-400    bg-gray-400/10    rounded-full px-2 py-0.5" },
  OUT_OF_SERVICE: { label: "Ngưng hoạt động", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};

const STATUS_MAP2: Record<InventoryStatus, { label: string; color: string }> = {
  ACTIVE:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  RESERVED:       { label: "Đã đặt",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  OUT_OF_STOCK:   { label: "Hết hàng", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};

type Tab        = "supply" | "vehicle";
type ImportType = "SUPPLY" | "VEHICLE";

export default function StockPage() {

  const [activeTab, setActiveTab] = useState<Tab>("supply");

  // ---------- SUPPLY STATE ----------
  const [supplyItems, setSupplyItems]             = useState<InventoryItem[]>([]);
  const [supplyLoading, setSupplyLoading]         = useState(true);
  const [supplyKeyword, setSupplyKeyword]         = useState("");
  const [supplyFile, setSupplyFile]               = useState<File | null>(null);
  const [supplyImportType, setSupplyImportType]   = useState<ImportType>("SUPPLY");
  const [supplyPage, setSupplyPage]               = useState(1);
  const [supplyTotalPages, setSupplyTotalPages]   = useState(1);
  const [supplyStats, setSupplyStats]             = useState({ total: 0, active: 0, reserved: 0, out_of_stock: 0 });
  const [allWarehouses, setAllWarehouses]         = useState<Warehouse[]>([]);

  // ---------- VEHICLE STATE ----------
  const [vehicles, setVehicles]                   = useState<InventoryItem[]>([]);
  const [allVehicleItems, setAllVehicleItems]     = useState<InventoryItem[]>([]);
  const [vehicleLoading, setVehicleLoading]       = useState(true);
  const [vehicleKeyword, setVehicleKeyword]       = useState("");
  const [vehicleFile, setVehicleFile]             = useState<File | null>(null);
  const [vehicleImportType, setVehicleImportType] = useState<ImportType>("VEHICLE");
  const [vehiclePage, setVehiclePage]             = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);
  const [vehicleStats, setVehicleStats]           = useState({
    total: 0, active: 0, in_use: 0, maintenance: 0, out_of_service: 0,
  });

  // ===============================
  // FETCH SUPPLY
  // ===============================

  const fetchSupplyStats = async () => {
    try {
      const res = await inventoryApi.getItems("?page=1&limit=99999&itemType=SUPPLY");
      const data = res.data || [];
      setSupplyStats({
        total:    data.length,
        active:   data.filter((i) => i.status === "ACTIVE").length,
        reserved: data.filter((i) => i.status === "RESERVED").length,
        out_of_stock: data.filter((i) => i.status === "OUT_OF_STOCK").length, 
      });
    } catch (err) { console.error(err); }
  };

  const fetchAllWarehouses = async () => {
    try {
      const res = await warehouseApi.getWarehouses();
      const valid = (res.data || []).filter(
        (wh: Warehouse) => wh.location?.coordinates?.length === 2
      );
      setAllWarehouses(valid);
    } catch (err) { console.error(err); }
  };

  const fetchSupplyItems = async (keyword = "", pageNumber = 1) => {
    setSupplyLoading(true);
    try {
      const query = `?page=${pageNumber}&limit=10&itemType=SUPPLY` +
        (keyword ? `&supplyName=${keyword}` : "");
      const res = await inventoryApi.getItems(query);
      setSupplyItems(res.data || []);
      setSupplyPage(res.meta?.page || 1);
      setSupplyTotalPages(res.meta?.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setSupplyLoading(false); }
  };

  // ===============================
  // FETCH VEHICLE
  // ===============================

  const fetchVehicleStats = async () => {
    try {
      const res = await inventoryApi.getItems("?page=1&limit=99999&itemType=VEHICLE");
      const data = res.data || [];
      setVehicleStats({
        total:          data.length,
        active:         data.filter((v: any) => v.status === "ACTIVE").length,
        in_use:         data.filter((v: any) => v.status === "IN_USE").length,
        maintenance:    data.filter((v: any) => v.status === "MAINTENANCE").length,
        out_of_service: data.filter((v: any) => v.status === "OUT_OF_SERVICE").length,
      });
      setAllVehicleItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchVehicles = async (keyword = "", pageNumber = 1) => {
    setVehicleLoading(true);
    try {
      const query = `?page=${pageNumber}&limit=10&itemType=VEHICLE` +
        (keyword ? `&licensePlate=${keyword}` : "");
      const res = await inventoryApi.getItems(query);
      setVehicles(res.data || []);
      setVehiclePage(res.meta?.page || 1);
      setVehicleTotalPages(res.meta?.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setVehicleLoading(false); }
  };

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    fetchSupplyStats();
    fetchAllWarehouses();
    fetchVehicleStats();
  }, []);

  useEffect(() => { fetchSupplyItems(supplyKeyword, supplyPage); }, [supplyPage, supplyKeyword]);
  useEffect(() => { fetchVehicles(vehicleKeyword, vehiclePage);  }, [vehiclePage, vehicleKeyword]);

  // ===============================
  // IMPORT HANDLERS
  // ===============================

  const handleSupplyImport = async () => {
    if (!supplyFile) return;
    try {
      await inventoryApi.importExcel(supplyFile, supplyImportType);
      alert("Import thành công");
      if (supplyImportType === "SUPPLY") {
        fetchSupplyItems(supplyKeyword, supplyPage);
        fetchSupplyStats();
      } else {
        fetchVehicles(vehicleKeyword, vehiclePage);
        fetchVehicleStats();
      }
    } catch { alert("Import thất bại"); }
  };

  const handleVehicleImport = async () => {
    if (!vehicleFile) return;
    try {
      await inventoryApi.importExcel(vehicleFile, vehicleImportType);
      alert("Import thành công");
      if (vehicleImportType === "VEHICLE") {
        fetchVehicles(vehicleKeyword, vehiclePage);
        fetchVehicleStats();
      } else {
        fetchSupplyItems(supplyKeyword, supplyPage);
        fetchSupplyStats();
      }
    } catch { alert("Import thất bại"); }
  };

  // ===============================
  // TABLE CONFIGS
  // ===============================

  const supplyColumns = [
    { key: "name",             header: "Tên vật tư" },
    { key: "quantity",         header: "Số lượng"   },
    { key: "reservedQuantity", header: "Đã đặt"     },
    { key: "unit",             header: "Đơn vị"     },
    { key: "warehouse",        header: "Kho"        },
    {
      key: "status", header: "Trạng thái",
      render: (row: any) => {
        const s = STATUS_MAP2[row.status as InventoryStatus];
        return s
          ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
          : row.status;
      }
    },
  ];

  const supplyTableData = supplyItems.map((item) => ({
    ...item,
    name:      typeof item.supplyID === "string" ? item.supplyID : item.supplyID?.name ?? "",
    unit:      typeof item.supplyID === "string" ? "" : item.supplyID?.unit ?? "",
    warehouse: typeof item.warehouse === "string" ? item.warehouse : item.warehouse?.name ?? "",
  }));

  const vehicleColumns = [
    { key: "licensePlate", header: "Biển số"    },
    { key: "warehouse",    header: "Kho"        },
    { key: "description",  header: "Mô tả"      },
    {
      key: "status", header: "Trạng thái",
      render: (row: any) => {
        const s = STATUS_MAP[row.status as VehicleStatus];
        return s
          ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
          : row.status;
      }
    },
  ];

  const vehicleTableData = vehicles.map((item: any) => ({
    ...item,
    licensePlate: item.vehicleID?.licensePlate ?? "—",
    description:  item.description ?? item.vehicleID?.description ?? "—",
    warehouse:    typeof item.warehouse === "string"
                    ? item.warehouse
                    : item.warehouse?.name ?? "—",
  }));

  // ===============================
  // SHARED COMPONENTS
  // ===============================

  const Pagination = ({ page, totalPages, onPrev, onNext, onPage }: {
    page: number; totalPages: number;
    onPrev: () => void; onNext: () => void; onPage: (p: number) => void;
  }) => (
    <div className="flex items-center gap-2">
      <button disabled={page === 1} onClick={onPrev}
        className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40">Prev</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i} onClick={() => onPage(i + 1)}
          className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white/10 text-white"}`}>
          {i + 1}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={onNext}
        className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40">Next</button>
    </div>
  );

  // Component ImportBar dùng chung
  const ImportBar = ({
    file, importType, onFileChange, onTypeChange, onImport,
  }: {
    file: File | null;
    importType: ImportType;
    onFileChange: (f: File | null) => void;
    onTypeChange: (t: ImportType) => void;
    onImport: () => void;
  }) => (
    <div className="flex gap-2 items-center">
      <select
        value={importType}
        onChange={(e) => onTypeChange(e.target.value as ImportType)}
        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
      >
        <option value="SUPPLY">Vật tư</option>
        <option value="VEHICLE">Phương tiện</option>
      </select>

      <label className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-sm text-white">
        📁 Chọn file
        <input type="file" className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
      </label>

      {file && (
        <span className="text-green-400 text-sm bg-green-400/10 px-3 py-1 rounded">
          {file.name}
        </span>
      )}

      <button onClick={onImport}
        className="px-4 py-2 bg-emerald-600 rounded-lg text-sm text-white">
        Import
      </button>
    </div>
  );

  // ===============================
  // UI
  // ===============================

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý kho</h1>
        <p className="text-slate-400 text-sm">Quản lý vật tư và phương tiện cứu hộ</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-white/10">
        {([
          { key: "supply",  label: "Vật tư"     },
          { key: "vehicle", label: "Phương tiện" },
        ] as { key: Tab; label: string }[]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== SUPPLY TAB ==================== */}
      {activeTab === "supply" && (
        <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Vật tư</p>
              <p className="text-xl font-bold text-white">{supplyStats.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Kho</p>
              <p className="text-xl font-bold text-emerald-400">{allWarehouses.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Sẵn sàng</p>
              <p className="text-xl font-bold text-amber-400">{supplyStats.active}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Đã đặt</p>
              <p className="text-xl font-bold text-blue-400">{supplyStats.reserved}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Hết hàng</p>
              <p className="text-xl font-bold text-red-400">{supplyStats.out_of_stock}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-2">
              <input value={supplyKeyword}
                onChange={(e) => setSupplyKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchSupplyItems(supplyKeyword, 1)}
                placeholder="Tìm vật tư..."
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
              <button onClick={() => fetchSupplyItems(supplyKeyword, 1)}
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white">Tìm</button>
            </div>

            <Pagination page={supplyPage} totalPages={supplyTotalPages}
              onPrev={() => setSupplyPage(supplyPage - 1)}
              onNext={() => setSupplyPage(supplyPage + 1)}
              onPage={setSupplyPage} />

            <ImportBar
              file={supplyFile}
              importType={supplyImportType}
              onFileChange={setSupplyFile}
              onTypeChange={setSupplyImportType}
              onImport={handleSupplyImport}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden text-white">
              {supplyLoading
                ? <div className="p-10 text-center text-slate-400">Loading...</div>
                : <Table columns={supplyColumns} data={supplyTableData as any[]} />}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="h-[450px]">
                <OpenMap warehouses={allWarehouses.map((wh) => ({
                  id: wh._id!, name: wh.name,
                  longitude: wh.location.coordinates[0],
                  latitude:  wh.location.coordinates[1],
                }))} />
              </div>
              <div className="border-t border-white/10 p-4">
                <p className="text-sm text-slate-300 font-semibold mb-3">
                  Danh sách kho ({allWarehouses.length})
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {allWarehouses.length === 0
                    ? <p className="text-xs text-slate-500">Không có kho nào</p>
                    : allWarehouses.map((wh) => (
                        <div key={wh._id}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                          <span className="text-sm text-slate-200">{wh.name}</span>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== VEHICLE TAB ==================== */}
      {activeTab === "vehicle" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Tổng</p>
              <p className="text-xl font-bold text-white">{vehicleStats.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Sẵn sàng</p>
              <p className="text-xl font-bold text-emerald-400">{vehicleStats.active}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Đang dùng</p>
              <p className="text-xl font-bold text-amber-400">{vehicleStats.in_use}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Bảo trì</p>
              <p className="text-xl font-bold text-blue-400">{vehicleStats.maintenance}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Ngưng hoạt động</p>
              <p className="text-xl font-bold text-red-400">{vehicleStats.out_of_service}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-2">
              <input value={vehicleKeyword}
                onChange={(e) => setVehicleKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchVehicles(vehicleKeyword, 1)}
                placeholder="Tìm biển số..."
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
              <button onClick={() => fetchVehicles(vehicleKeyword, 1)}
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white">Tìm</button>
            </div>

            <Pagination page={vehiclePage} totalPages={vehicleTotalPages}
              onPrev={() => setVehiclePage(vehiclePage - 1)}
              onNext={() => setVehiclePage(vehiclePage + 1)}
              onPage={setVehiclePage} />

            <ImportBar
              file={vehicleFile}
              importType={vehicleImportType}
              onFileChange={setVehicleFile}
              onTypeChange={setVehicleImportType}
              onImport={handleVehicleImport}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden text-white">
              {vehicleLoading
                ? <div className="p-10 text-center text-slate-400">Loading...</div>
                : <Table columns={vehicleColumns} data={vehicleTableData as any[]} />}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="h-[450px]">
                 <OpenMap warehouses={allWarehouses.map((wh) => ({
                  id: wh._id!, name: wh.name,
                  longitude: wh.location.coordinates[0],
                  latitude:  wh.location.coordinates[1],
                }))} />
              </div>
              <div className="border-t border-white/10 p-4">
                <p className="text-sm text-slate-300 font-semibold mb-3">
                  Kho chứa phương tiện
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {allVehicleItems.length === 0
                    ? <p className="text-xs text-slate-500">Chưa có phương tiện nào</p>
                    : [...new Map(
                        allVehicleItems
                          .map((item: any) => item.warehouse)
                          .filter(Boolean)
                          .map((wh: any) => [
                            typeof wh === "string" ? wh : wh._id,
                            typeof wh === "string" ? wh : wh.name,
                          ])
                      ).entries()].map(([id, name]) => (
                        <div key={id}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                          <span className="text-sm text-slate-200">{name}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}