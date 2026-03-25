"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Vehicle, VehicleStatus } from "@/modules/vehicles/domain/vehicles.enity";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";

import { Supply, SupplyStatus } from "@/modules/supplies/domain/supply.entity";
import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";

import { Warehouse, WAREHOUSE_STATUS } from "@/modules/warehouse/domain/warehouse.entity";
import { warehouseApi } from "@/modules/warehouse/infrastructure/warehouse.api";

import { GetLocationUseCase } from "@/modules/map/application/getLocation.usecase";
import { mapRepository } from "@/modules/map/infrastructure/map.repository.impl";

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

// ─── Status styles ───────────────────────────────────────────────────────────
const STATUS_SUPPLIES: Record<SupplyStatus, { label: string; bg: string; color: string; border: string }> = {
  SUBMITTED: { label: "Sẵn sàng",  bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
  CANCELLED: { label: "Đã hủy",    bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
  CLOSED:    { label: "Đã đóng",   bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
};

const STATUS_VEHICLE: Record<VehicleStatus, { label: string; bg: string; color: string; border: string }> = {
  ACTIVE:         { label: "Sẵn sàng",       bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
  IN_USE:         { label: "Đang sử dụng",   bg: "#e6f7ff", color: "#096dd9", border: "#91d5ff" },
  MAINTENANCE:    { label: "Bảo trì",         bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
  OUT_OF_SERVICE: { label: "Ngưng hoạt động",bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
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
  const [loading, setLoading] = useState(true);

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

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchVehicles = async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await vehicleApi.getVehicles(`?page=${page}&limit=10&licensePlate=${keyword}|&type=${keyword}|&brand=${keyword}`);
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
      const res = await supplyApi.getSupplies(`?page=${page}&limit=10&name=${keyword}`);
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
      const res = await warehouseApi.getWarehouses(`?page=${page}&limit=10&name=${keyword}`);
      setWarehouses(res.data || []);
      setWarehousePage(res.meta?.page || 1);
      setWarehouseTotalPages(res.meta?.totalPages || 1);
      setWarehouseTotal(res.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => { fetchVehicles(vehiclePage, vehicleKeyword); }, [vehiclePage, vehicleKeyword]);
  useEffect(() => { fetchSupplies(supplyPage, supplyKeyword); }, [supplyPage, supplyKeyword]);
  useEffect(() => { fetchWarehouses(warehousePage, warehouseKeyword); }, [warehousePage, warehouseKeyword]);

  const TAB_CONFIG: { label: "Phương Tiện" | "Vật Tư" | "Kho"; color: string }[] = [
    { label: "Phương Tiện", color: "#1890ff" },
    { label: "Vật Tư", color: "#52c41a" },
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Phương Tiện" value={vehicleTotal} accentColor="#1890ff" />
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
              style={inputStyle}
              placeholder="Tìm biển số..."
            />
            <Pagination page={vehiclePage} totalPages={vehicleTotalPages} setPage={setVehiclePage} />
          </div>

          <DataTable
            loading={loading}
            columns={[
              { key: "licensePlate", label: "Biển số" },
              { key: "type", label: "Loại" },
              { key: "brand", label: "Hãng" },
              {
                key: "status",
                label: "Trạng thái",
                render: (row: Vehicle) => {
                  const s = STATUS_VEHICLE[row.status as VehicleStatus];
                  return s ? <StatusBadge {...s} /> : <span>{row.status}</span>;
                },
              },
            ]}
            data={vehicles}
          />
        </div>
      )}

      {/* ─── SUPPLY ─── */}
      {activeTab === "Vật Tư" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Vật Tư" value={supplyTotal} accentColor="#52c41a" />
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
              style={inputStyle}
              placeholder="Tìm vật tư..."
            />
            <Pagination page={supplyPage} totalPages={supplyTotalPages} setPage={setSupplyPage} />
          </div>

          <DataTable
            loading={loading}
            columns={[
              { key: "name", label: "Tên" },
              { key: "category", label: "Danh mục" },
              { key: "unit", label: "Đơn vị" },
              { key: "unitWeight", label: "Trọng lượng" },
              {
                key: "status",
                label: "Trạng thái",
                render: (row: Supply) => {
                  const s = STATUS_SUPPLIES[row.status as SupplyStatus];
                  return s ? <StatusBadge {...s} /> : <span>{row.status}</span>;
                },
              },
            ]}
            data={supplies}
          />
        </div>
      )}

      {/* ─── WAREHOUSE ─── */}
      {activeTab === "Kho" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <StatCard title="Tổng Kho" value={warehouseTotal} accentColor="#fa8c16" />
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
              value={warehouseKeyword}
              onChange={(e) => setWarehouseKeyword(e.target.value)}
              style={inputStyle}
              placeholder="Tìm kho..."
            />
            <Pagination page={warehousePage} totalPages={warehouseTotalPages} setPage={setWarehousePage} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: "16px",
            }}
          >
            <DataTable
              loading={loading}
              columns={[
                { key: "name", label: "Tên kho" },
                {
                  key: "location",
                  label: "Địa chỉ",
                  render: (row: Warehouse) => warehouseAddresses[row._id] || "Đang tải...",
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  render: (row: Warehouse) => {
                    const s = STATUS_WAREHOUSE[row.status as WAREHOUSE_STATUS];
                    return s ? <StatusBadge {...s} /> : <span>{row.status}</span>;
                  },
                },
              ]}
              data={warehouses}
            />

            {/* Map panel */}
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ height: "340px" }}>
                <OpenMap
                  warehouses={warehouses.map((w) => ({
                    id: w._id,
                    name: w.name,
                    longitude: w.location.coordinates[0],
                    latitude: w.location.coordinates[1],
                  }))}
                />
              </div>
              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  padding: "14px 16px",
                  maxHeight: "160px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {warehouses.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#8c8c8c" }}>Không có dữ liệu bản đồ</p>
                ) : (
                  warehouses.map((wh) => (
                    <div
                      key={wh._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        transition: "background 0.15s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#e6f7ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#1890ff",
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#141414" }}>{wh.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}