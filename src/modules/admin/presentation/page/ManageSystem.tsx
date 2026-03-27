"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { Vehicle, VehicleStatus } from "@/modules/vehicles/domain/vehicles.enity";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";

import { Supply, SupplyStatus } from "@/modules/supplies/domain/supply.entity";
import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";

import { Warehouse, WAREHOUSE_STATUS } from "@/modules/warehouse/domain/warehouse.entity";
import { warehouseApi } from "@/modules/warehouse/infrastructure/warehouse.api";

import { GetLocationUseCase } from "@/modules/map/application/getLocation.usecase";
import { mapRepository } from "@/modules/map/infrastructure/map.repository.impl";
import { GetSuppliesUseCase, supplyRepository } from "@/modules/supplies";
import { GetWarehouseUseCase } from "@/modules/warehouse/application/getWarehouse.usecase";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import { GetVehiclesUseCase, vehicleRepository } from "@/modules/vehicles";
import { Table } from "@/shared/ui/components/Table";

// Tránh lỗi SSR với maplibre-gl
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "256px",
          background: "#f5f6fa",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8c8c8c",
          fontSize: "13px",
          border: "1px solid #f0f0f0",
        }}
      >
        Đang tải bản đồ...
      </div>
    ),
  }
);

const getLocationUseCase = new GetLocationUseCase(mapRepository);
const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getWarehousesUseCase = new GetWarehouseUseCase(warehouseRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);

// ─── Status styles ───────────────────────────────────────────────────────────
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

const STATUS_WAREHOUSE: Record<WAREHOUSE_STATUS, { label: string; bg: string; color: string; border: string }> = {
  FULL:        { label: "Đầy",    bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
  EMPTY:       { label: "Trống",  bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
  MAINTENANCE: { label: "Bảo trì",bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
};

function StatusBadge({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 600,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Shared Table ─────────────────────────────────────────────────────────────
function DataTable({ columns, data, loading }: { columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[]; data: any[]; loading: boolean }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#8c8c8c", fontSize: "13px" }}>
          Đang tải...
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    color: "#8c8c8c",
                    fontWeight: 600,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #fafafa",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e6f7ff22")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa")}
              >
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "10px 16px", color: "#141414", fontWeight: 500 }}>
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
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        style={{
          padding: "6px 14px",
          borderRadius: "6px",
          border: "1px solid #d9d9d9",
          background: "#fff",
          color: "#595959",
          fontWeight: 500,
          fontSize: "12px",
          cursor: page === 1 ? "not-allowed" : "pointer",
          opacity: page === 1 ? 0.4 : 1,
        }}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: page === i + 1 ? "none" : "1px solid #d9d9d9",
            background: page === i + 1 ? "#1890ff" : "#fff",
            color: page === i + 1 ? "#fff" : "#595959",
            fontWeight: 600,
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        style={{
          padding: "6px 14px",
          borderRadius: "6px",
          border: "1px solid #d9d9d9",
          background: "#fff",
          color: "#595959",
          fontWeight: 500,
          fontSize: "12px",
          cursor: page === totalPages ? "not-allowed" : "pointer",
          opacity: page === totalPages ? 0.4 : 1,
        }}
      >
        Next
      </button>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, accentColor }: { title: string; value: number; accentColor: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "20px 24px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${accentColor}`,
        minWidth: "180px",
      }}
    >
      <p style={{ fontSize: "12px", color: "#8c8c8c", fontWeight: 500, marginBottom: "8px" }}>{title}</p>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "#141414" }}>{value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState<"Phương Tiện" | "Vật Tư" | "Kho">("Phương Tiện");
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);
  const [vehicleTotal, setVehicleTotal] = useState(0);

  const [supplyKeyword, setSupplyKeyword] = useState("");
  const [supplyPage, setSupplyPage] = useState(1);
  const [supplyTotalPages, setSupplyTotalPages] = useState(1);
  const [supplyTotal, setSupplyTotal] = useState(0);

  const [warehouseKeyword, setWarehouseKeyword] = useState("");
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseTotalPages, setWarehouseTotalPages] = useState(1);
  const [warehouseTotal, setWarehouseTotal] = useState(0);
  const [warehouseAddresses, setWarehouseAddresses] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();


  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchVehicles = async (page: number, keyword: string) => {
    setLoadingVehicles(true);
    try {
      let mappedType = keyword;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (kw.includes("cứu thương") || kw.includes("ambulance")) mappedType = "AMBULANCE";
        else if (kw.includes("xuồng") || kw.includes("thuyền") || kw.includes("boat")) mappedType = "RESCUE_BOAT";
        else if (kw.includes("cứu hỏa") || kw.includes("fire")) mappedType = "FIRE_TRUCK";
        else if (kw.includes("bán tải") || kw.includes("van")) mappedType = "VAN";
        else if (kw.includes("tải") || kw.includes("truck")) mappedType = "TRUCK";
        else if (kw.includes("mô tô") || kw.includes("xe máy") || kw.includes("motor")) mappedType = "MOTORCYCLE";
        else if (kw.includes("khác") || kw.includes("other")) mappedType = "OTHERS";
      }

      const query =
        `?page=${page}&limit=10` +
        (keyword ? `&licensePlate=${encodeURIComponent(keyword)}|&type=${encodeURIComponent(mappedType)}|&brand=${encodeURIComponent(keyword)}` : "");
      const res = await vehicleApi.getVehicles(query);

      setVehicles(res.data || []);
      setVehiclePage(res.meta?.page || 1);
      setVehicleTotalPages(res.meta?.totalPages || 1);

    } catch (error) { 
      console.error("Fetch supplies error:", error);
    } finally {
      setLoadingVehicles(false);
    }

    const [vehiclesRes] =
        await Promise.all([
          getVehiclesUseCase.execute(),
    ]);
      setVehicleTotal(vehiclesRes.total ?? 0);

  };
  const columnsVehicle = [
      {
        key: "licensePlate",
        header: "Biển số",
        render: (row: Vehicle) => row.licensePlate ?? "-"
      },
      {
        key: "brand",
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
                const s = STATUS_VEHICLE[row.status as VehicleStatus];
                return s
                  ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                  : row.status;
              }
      },
    ];
/*--------------------Fetch Supplies--------------------*/
  const fetchSupplies = async (page: number, keyword: string) => {
    setLoadingSupplies(true);
    try {
      const query =
        `?page=${page}&limit=10` +
        (keyword ? `&name=${encodeURIComponent(keyword)}` : "");

      const res = await supplyApi.getSupplies(query);

      setSupplies(res.data || []);
      setSupplyPage(res.meta?.page || 1);
      setSupplyTotalPages(res.meta?.totalPages || 1);

    } catch (error) {
      console.error("Fetch supplies error:", error);
    } finally {
      setLoadingSupplies(false);
    }

    const [suppliesRes] =
      await Promise.all([
        getSuppliesUseCase.execute(),
      ]);

    setSupplyTotal(suppliesRes.meta?.total ?? 0);

  };

  const columnsSupplies = [
      { key: "name", header: "Tên" },
      { key: "category", header: "Loại" },
      { key: "unit", header: "Đơn vị" },
      { key: "unitWeight", header: "Trọng lượng" },
      {
            key: "status",
            header: "Trạng thái",
            render: (row: Supply) => {
              const s = STATUS_SUPPLIES[row.status as SupplyStatus];
                     return s
                       ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                       : row.status;
                   }
          },
    ];
/*--------------------Fetch Warehouses--------------------*/
  const fetchWarehouses = async (page: number, keyword: string) => {
    setLoadingWarehouses(true);
    try {
      const query =
        `?page=${page}&limit=10` +
        (keyword ? `&name=${encodeURIComponent(keyword)}` : "");

      const res = await warehouseApi.getWarehouses(query);

      setWarehouses(res.data || []);
      setWarehousePage(res.meta?.page || 1);
      setWarehouseTotalPages(res.meta?.totalPages || 1);

    } catch (error) {
      console.error("Fetch warehouses error:", error);
    } finally {
    setLoadingWarehouses(false);
    }

    const [warehousesRes] =
        await Promise.all([
          getWarehousesUseCase.execute(),
        ]);

      setWarehouseTotal(warehousesRes.total ?? 0);
  };

  const columnsWarehouse=[
    { key: "name", header: "Tên kho" },
    {
      key: "location",
      header: "Địa chỉ",
      render: (row: Warehouse) => warehouseAddresses[row._id] || "Đang tải...",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Warehouse) => {
        const s = STATUS_WAREHOUSE[row.status as WAREHOUSE_STATUS];
        return s ? <StatusBadge {...s} /> : <span>{row.status}</span>;
      },
    },
  ];


  const getAddressFromCoordinates = async (lat: number, lon: number, warehouseId: string) => {
    try {
      const location = await getLocationUseCase.getAddressFromCoordinates({ latitude: lat, longitude: lon });
      setWarehouseAddresses((prev) => ({ ...prev, [warehouseId]: location.address.display }));
    } catch {
      setWarehouseAddresses((prev) => ({ ...prev, [warehouseId]: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
    }
  };

  useEffect(() => {
    if (!warehouses.length) return;
    const fetchAddresses = async () => {
      for (const warehouse of warehouses) {
        const lat = warehouse.location?.coordinates?.[1];
        const lon = warehouse.location?.coordinates?.[0];
        if (!lat || !lon) continue;
        if (!warehouseAddresses[warehouse._id]) {
          await getAddressFromCoordinates(lat, lon, warehouse._id);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    };
    fetchAddresses();
  }, [warehouses]);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "Phương Tiện" || tab === "Vật Tư" || tab === "Kho") {
      setActiveTab(tab);
    }
  }, [searchParams]);

 useEffect(() => {
  if (activeTab === "Phương Tiện") {
    fetchVehicles(vehiclePage, vehicleKeyword);
  }
}, [activeTab,vehicleKeyword, vehiclePage]);

useEffect(() => {
  if (activeTab === "Vật Tư") {
    fetchSupplies(supplyPage, supplyKeyword);
  }
}, [activeTab, supplyPage, supplyKeyword]);

useEffect(() => {
  if (activeTab === "Kho") {
    fetchWarehouses(warehousePage, warehouseKeyword);
  }
}, [activeTab, warehousePage, warehouseKeyword]);

  const TAB_CONFIG: { label: "Phương Tiện" | "Vật Tư" | "Kho"; color: string }[] = [
    { label: "Phương Tiện", color: "#00629D" },
    { label: "Vật Tư", color: "#1890ff" },
    { label: "Kho", color: "#fa8c16" },
  ];

  const inputStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d9d9d9",
    fontSize: "13px",
    color: "#141414",
    background: "#fafafa",
    width: "280px",
    outline: "none",
  };

  return (
    <div
      style={{
        padding: "24px 28px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#f5f6fa",
        minHeight: "100vh",
        color: "#141414",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#141414", margin: 0 }}>Quản lý hệ thống</h1>
        <p style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "4px" }}>
          Quản lý tổng quan kho, phương tiện và vật tư.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "20px",
          background: "#fff",
          borderRadius: "8px 8px 0 0",
          padding: "0 8px",
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {TAB_CONFIG.map(({ label, color }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            style={{
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: activeTab === label ? color : "#8c8c8c",
              borderBottom: activeTab === label ? `2px solid ${color}` : "2px solid transparent",
              marginBottom: "-1px",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── VEHICLE ─── */}
      {activeTab === "Phương Tiện" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Phương Tiện" value={vehicleTotal} accentColor="#00629D" />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "8px",
              padding: "12px 16px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <input
              value={vehicleKeyword}
              onChange={(e) => setVehicleKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVehicles(1, vehicleKeyword)}
              style={inputStyle}
              placeholder="Tìm biển số..."
            />
            
            <Pagination page={vehiclePage} totalPages={vehicleTotalPages} setPage={setVehiclePage} />
          </div>

           {/* Table */}
            {loadingVehicles ? (
                  <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mx-auto"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl shadow-sm border border-gray-100">
                    Không tìm thấy phương tiện nào
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-900"
                    style={{
                      flex: 1,
                      overflow: "auto",
                    }}
                  >
                    <Table columns={columnsVehicle} data={vehicles} striped={true} hoverable={true} />
                  </div>
                )}
          </div>
      )}

      {/* ─── SUPPLY ─── */}
      {activeTab === "Vật Tư" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Vật Tư" value={supplyTotal} accentColor="#1890ff" />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "8px",
              padding: "12px 16px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <input
              value={supplyKeyword}
              onChange={(e) => setSupplyKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSupplies(1, supplyKeyword)}
              style={inputStyle}
              placeholder="Tìm vật tư..."
            />
            
            <Pagination page={supplyPage} totalPages={supplyTotalPages} setPage={setSupplyPage} />
          </div>
        {/*Table*/}
          {loadingSupplies ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : supplies.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl shadow-sm border border-gray-100">
              <p>Không tìm thấy vật tư nào</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-900"
              style={{
                flex: 1,
                overflow: "auto",
              }}
            >
              <Table columns={columnsSupplies} data={supplies} striped={true} hoverable={true} />
            </div>
          )}
        </div>
      )}
      {/* ─── WAREHOUSE ─── */}
      {activeTab === "Kho" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Stat */}
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Kho" value={warehouseTotal} accentColor="#fa8c16" />
          </div>

          {/* Search + Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            borderRadius: "8px",
            padding: "12px 16px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <input
            value={warehouseKeyword}
            onChange={(e) => setWarehouseKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWarehouses(1, warehouseKeyword)}
            style={inputStyle}
            placeholder="Tìm kho..."
          />
          
          <Pagination
            page={warehousePage}
            totalPages={warehouseTotalPages}
            setPage={setWarehousePage}
          />
        </div>

    {/* MAIN GRID */}
      <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "16px",
            alignItems: "stretch", // 👈 fix chiều cao
          }}
      >
      {/* TABLE */}
        {loadingWarehouses ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl shadow-sm border border-gray-100">
            Không tìm thấy kho nào
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
            <Table columns={columnsWarehouse} data={warehouses} striped hoverable />
          </div>
        )}

      {/* MAP PANEL */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            height: "100%", 
          }}
        >
        {/* MAP */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-[450px]">
              <OpenMap warehouses={warehouses.map((wh) => ({
                id: wh._id!, name: wh.name,
                longitude: wh.location.coordinates[0],
                latitude:  wh.location.coordinates[1],
              }))} />
            </div>
            <div className="border-t border-gray-100 p-6">
              <p className="text-sm text-gray-900 font-bold mb-4">
                Danh sách kho ({warehouses.length})
              </p>
                <div className="space-y-3 max-h-44 overflow-y-auto custom-scrollbar">
                  {warehouses.length === 0
                    ? <p className="text-sm font-medium text-gray-400">Không có kho nào</p>
                    : warehouses.map((wh) => (
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
          </div>
        </div>
      )}
    </div>
  );
}