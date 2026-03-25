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
import { Upload } from "lucide-react";
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
  

  const handleUseSupply = async (item: any) => {
  const quantity = Number(prompt("Nhập số lượng cần dùng:"));

  if (!quantity || quantity <= 0) return;

  if (quantity > item.quantity) {
    alert("Số lượng xuất vượt quá số lượng trong kho");
    return;
  }

  const supplyID = typeof item.supplyID === 'string' ? item.supplyID : item.supplyID?._id;
  const warehouseId = typeof item.warehouse === 'string' ? item.warehouse : item.warehouse?._id;

  console.log("SEND:", { supplyID, warehouseId, quantity });

  try {
    await inventoryApi.useSupply(
      supplyID,
      warehouseId,
      quantity
    );

    alert("Dùng vật tư thành công");

    fetchSupplyItems(supplyKeyword, supplyPage);
    fetchSupplyStats();

  } catch (err: any) {
    alert(err?.response?.data?.message || "Lỗi khi dùng vật tư");
  }
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
    { key: "warehouseName",    header: "Kho"        },
    {
      key: "status", header: "Trạng thái",
      render: (row: any) => {
        const s = STATUS_MAP2[row.status as InventoryStatus];
        return s
          ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
          : row.status;
      }
    },
    {
      key: "action",
      header: "Hành động",
      render: (row: any) => (
        <button
          onClick={() => handleUseSupply(row)}
          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
        >
          Dùng
        </button>
      )
    }
  ];

  const supplyTableData = supplyItems.map((item) => ({
    ...item,
    name:          typeof item.supplyID === "string" ? item.supplyID : item.supplyID?.name ?? "",
    unit:          typeof item.supplyID === "string" ? "" : item.supplyID?.unit ?? "",
    warehouseName: typeof item.warehouse === "string" ? item.warehouse : item.warehouse?.name ?? "",
  }));

  const vehicleColumns = [
    { key: "licensePlate", header: "Biển số"    },
    { key: "warehouseName",header: "Kho"        },
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
    warehouseName:typeof item.warehouse === "string"
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
    <div className="flex items-center justify-center gap-3">
      <button disabled={page === 1} onClick={onPrev}
        className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm font-medium">Prev</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i} onClick={() => onPage(i + 1)}
          className={`w-10 h-10 rounded-full font-bold shadow-sm flex items-center justify-center transition-colors ${page === i + 1 ? "bg-[#1A3263] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={onNext}
        className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm font-medium">Next</button>
    </div>
  );

  const ImportBar = ({
    file, importType, onFileChange, onTypeChange, onImport,
  }: {
    file: File | null;
    importType: ImportType;
    onFileChange: (f: File | null) => void;
    onTypeChange: (t: ImportType) => void;
    onImport: () => void;
  }) => (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <select
        value={importType}
        onChange={(e) => onTypeChange(e.target.value as ImportType)}
        className="px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="SUPPLY">Vật tư</option>
        <option value="VEHICLE">Phương tiện</option>
      </select>

      <label className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors shadow-sm">
          <Upload className="w-5 h-5" />
          <span>Chọn file</span>
        <input type="file" className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
      </label>

      {file && (
        <span className="text-emerald-700 text-sm font-medium bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
          {file.name}
        </span>
      )}

      <button onClick={onImport}
        disabled={!file}
         className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50 transition-colors"
          >
            ⬆ Import
          </button>
    </div>
  );

  // ===============================
  // UI
  // ===============================

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Quản lý kho</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý vật tư và phương tiện cứu hộ</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200">
        {([
          { key: "supply",  label: "Vật tư"     },
          { key: "vehicle", label: "Phương tiện" },
        ] as { key: Tab; label: string }[]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-bold border-b-2 -mb-[1px] transition-colors ${
              activeTab === tab.key
                ? "border-[#4C7AAC] text-[#4C7AAC]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== SUPPLY TAB ==================== */}
      {activeTab === "supply" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#1A3263] rounded-3xl p-6 shadow-md relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">Tổng</p>
              <p className="text-4xl font-bold text-white relative z-10">{supplyStats.total}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Kho</p>
              <p className="text-4xl font-bold text-emerald-600">{allWarehouses.length}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Sẵn sàng</p>
              <p className="text-4xl font-bold text-emerald-500">{supplyStats.active}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Đã đặt</p>
              <p className="text-4xl font-bold text-amber-500">{supplyStats.reserved}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Hết hàng</p>
              <p className="text-4xl font-bold text-red-500">{supplyStats.out_of_stock}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input value={supplyKeyword}
                onChange={(e) => setSupplyKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchSupplyItems(supplyKeyword, 1)}
                placeholder="Tìm vật tư..."
                className="w-full md:w-80 px-6 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              <button onClick={() => fetchSupplyItems(supplyKeyword, 1)}
                className="px-6 py-3 bg-[#1A3263] hover:bg-[#1A3263]/80 rounded-full font-bold text-white shadow-sm transition-colors">Tìm kiếm</button>
            </div>

            <ImportBar
              file={supplyFile}
              importType={supplyImportType}
              onFileChange={setSupplyFile}
              onTypeChange={setSupplyImportType}
              onImport={handleSupplyImport}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900 flex flex-col">
              {supplyLoading
                ? <div className="p-20 text-center text-gray-500 font-medium">Loading...</div>
                : <>
                    <div className="overflow-x-auto p-2">
                      <Table columns={supplyColumns} data={supplyTableData as any[]} />
                    </div>
                    <div className="p-4 mt-auto border-t border-gray-100">
                      <Pagination page={supplyPage} totalPages={supplyTotalPages}
                        onPrev={() => setSupplyPage(supplyPage - 1)}
                        onNext={() => setSupplyPage(supplyPage + 1)}
                        onPage={setSupplyPage} />
                    </div>
                  </>
                }
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-[450px]">
                <OpenMap warehouses={allWarehouses.map((wh) => ({
                  id: wh._id!, name: wh.name,
                  longitude: wh.location.coordinates[0],
                  latitude:  wh.location.coordinates[1],
                }))} />
              </div>
              <div className="border-t border-gray-100 p-6">
                <p className="text-sm text-gray-900 font-bold mb-4">
                  Danh sách kho ({allWarehouses.length})
                </p>
                <div className="space-y-3 max-h-44 overflow-y-auto custom-scrollbar">
                  {allWarehouses.length === 0
                    ? <p className="text-sm font-medium text-gray-400">Không có kho nào</p>
                    : allWarehouses.map((wh) => (
                        <div key={wh._id}
                          className="flex items-center gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 px-4 py-3 rounded-2xl transition-colors">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">{wh.name}</span>
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
            <div className="bg-[#1A3263] rounded-3xl p-6 shadow-md relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">Tổng</p>
              <p className="text-4xl font-bold text-white relative z-10">{vehicleStats.total}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Sẵn sàng</p>
              <p className="text-4xl font-bold text-emerald-500">{vehicleStats.active}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Đang dùng</p>
              <p className="text-4xl font-bold text-amber-500">{vehicleStats.in_use}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Bảo trì</p>
              <p className="text-4xl font-bold text-blue-500">{vehicleStats.maintenance}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-2">Ngưng hoạt động</p>
              <p className="text-4xl font-bold text-red-500">{vehicleStats.out_of_service}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input value={vehicleKeyword}
                onChange={(e) => setVehicleKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchVehicles(vehicleKeyword, 1)}
                placeholder="Tìm biển số..."
                className="w-full md:w-80 px-6 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              <button onClick={() => fetchVehicles(vehicleKeyword, 1)}
                className="px-6 py-3 bg-[#1A3263] hover:bg-[#1A3263]/80 rounded-full font-bold text-white shadow-sm transition-colors">Tìm kiếm</button>
            </div>

            <ImportBar
              file={vehicleFile}
              importType={vehicleImportType}
              onFileChange={setVehicleFile}
              onTypeChange={setVehicleImportType}
              onImport={handleVehicleImport}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900 flex flex-col">
              {vehicleLoading
                ? <div className="p-20 text-center text-gray-500 font-medium">Loading...</div>
                : <>
                    <div className="overflow-x-auto p-2">
                      <Table columns={vehicleColumns} data={vehicleTableData as any[]} />
                    </div>
                    <div className="p-4 mt-auto border-t border-gray-100">
                      <Pagination page={vehiclePage} totalPages={vehicleTotalPages}
                        onPrev={() => setVehiclePage(vehiclePage - 1)}
                        onNext={() => setVehiclePage(vehiclePage + 1)}
                        onPage={setVehiclePage} />
                    </div>
                  </>
                }
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-[450px]">
                 <OpenMap warehouses={allWarehouses.map((wh) => ({
                  id: wh._id!, name: wh.name,
                  longitude: wh.location.coordinates[0],
                  latitude:  wh.location.coordinates[1],
                }))} />
              </div>
              <div className="border-t border-gray-100 p-6">
                <p className="text-sm font-bold text-gray-900 mb-4">
                  Kho chứa phương tiện
                </p>
                <div className="space-y-3 max-h-44 overflow-y-auto custom-scrollbar">
                  {allVehicleItems.length === 0
                    ? <p className="text-sm text-gray-400 font-medium">Chưa có phương tiện nào</p>
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
                          className="flex items-center gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 px-4 py-3 rounded-2xl transition-colors">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">{name}</span>
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