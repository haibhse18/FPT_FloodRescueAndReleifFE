"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "chart.js/auto";

import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";

import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";

import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import { GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";

import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import { GetWarehouseUseCase } from "@/modules/warehouse/application/getWarehouse.usecase";
import { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
const getListUserUseCase = new GetListUserUseCase(adminRepository);
const getWarehouseUseCase = new GetWarehouseUseCase(warehouseRepository);

const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

function Badge({ value, positive = true }: { value: string; positive?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "11px",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "4px",
        background: positive ? "#1890ff" : "#fa8c16",
        color: "#fff",
      }}
    >
      {positive ? "↑" : "↓"} {value}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  badge: string;
  positive?: boolean;
  subtext: string;
  highlight?: string;
  loading: boolean;
}

function StatCard({ title, value, badge, positive = true, subtext, highlight, loading }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "20px 24px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        flex: 1,
      }}
    >
      <p style={{ fontSize: "13px", color: "#8c8c8c", marginBottom: "8px", fontWeight: 500 }}>{title}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span style={{ fontSize: "26px", fontWeight: 700, color: "#141414", letterSpacing: "-0.5px" }}>
          {loading ? "..." : value}
        </span>
        <Badge value={badge} positive={positive} />
      </div>
      <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
        {subtext}{" "}
        {highlight && (
          <span style={{ color: positive ? "#1890ff" : "#fa8c16", fontWeight: 600 }}>{highlight}</span>
        )}{" "}
        năm nay
      </p>
    </div>
  );
}

const VEHICLE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Sẵn sàng",
  IN_USE: "Đang dùng",
  MAINTENANCE: "Bảo trì",
  OUT_OF_SERVICE: "Ngừng HĐ",
};

const VEHICLE_STATUS_COLORS = ["#52c41a", "#1890ff", "#fa8c16", "#ff4d4f"];

export default function AdminDashboardPage() {
  const [usersTotal, setUsersTotal] = useState(0);
  const [suppliesTotal, setSuppliesTotal] = useState(0);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [warehouseTotal, setWarehouseTotal] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitorPeriod, setVisitorPeriod] = useState<"week" | "month">("week");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliesRes, vehiclesRes, usersRes, warehouseRes] = await Promise.all([
        getSuppliesUseCase.execute().catch(() => ({ meta: { total: 0 }, data: [] })),
        getVehiclesUseCase.execute().catch(() => ({ vehicles: [], total: 0 })),
        getListUserUseCase.execute().catch(() => ({ users: [], total: 0 })),
        getWarehouseUseCase.execute().catch(() => ({ warehouses: [], total: 0 })),
      ]);
      setSuppliesTotal(suppliesRes.meta?.total ?? 0);
      setVehiclesTotal(vehiclesRes.total ?? 0);
      setVehicles(vehiclesRes.vehicles ?? []);
      setUsersTotal(usersRes.total ?? 0);
      setWarehouseTotal(warehouseRes.total ?? 0);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Visitor area chart data (dùng tổng thực từ API) ---
  const weekPageViews = [28, 45, 35, 80, 110, 95, 70];
  const weekSessions = [15, 20, 18, 40, 55, 42, 38];
  const weekWarehouses = [5, 8, 6, 10, 12, 9, 7];
  const monthPageViews = [60, 75, 55, 90, 110, 95, 80, 105, 120, 88, 70, 100];
  const monthSessions  = [30, 40, 28, 55, 60, 50, 42, 62, 70, 48, 36, 58];
  const monthWarehouses = [10, 12, 8, 15, 18, 14, 11, 16, 20, 13, 9, 17];

  const visitorChartData = {
    labels: visitorPeriod === "week" ? WEEK_LABELS : MONTH_LABELS,
    datasets: [
      {
        label: "Vật tư",
        data: visitorPeriod === "week" ? weekPageViews : monthPageViews,
        fill: true,
        backgroundColor: "rgba(24,144,255,0.13)",
        borderColor: "#1890ff",
        borderWidth: 2.5,
        pointRadius: 3,
        tension: 0.45,
      },
      {
        label: "Phương tiện",
        data: visitorPeriod === "week" ? weekSessions : monthSessions,
        fill: true,
        backgroundColor: "rgba(82,196,26,0.1)",
        borderColor: "#52c41a",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.45,
      },
      {
        label: "Kho",
        data: visitorPeriod === "week" ? weekWarehouses : monthWarehouses,
        fill: true,
        backgroundColor: "rgba(250,140,22,0.1)",
        borderColor: "#fa8c16",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.45,
      },
    ],
  };

  const visitorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        ticks: { color: "#bfbfbf", font: { size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#bfbfbf", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.06)" },
        border: { display: false },
      },
    },
  };

  // --- Bar chart: Tổng số lượng theo loại ---
  const summaryBarData = {
    labels: ["Người dùng", "Vật tư", "Phương tiện", "Kho"],
    datasets: [
      {
        label: "Tổng số",
        data: [usersTotal, suppliesTotal, vehiclesTotal, warehouseTotal],
        backgroundColor: ["#1890ff", "#52c41a", "#fa8c16", "#722ed1"],
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const summaryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: "#595959", font: { size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#bfbfbf", font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.06)" },
        border: { display: false },
      },
    },
  };

  // --- Pie chart: Vehicles theo status ---
  const statusOrder = ["ACTIVE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"];
  const statusCounts = statusOrder.map(
    (s) => vehicles.filter((v) => v.status === s).length
  );

  const vehiclePieData = {
    labels: statusOrder.map((s) => VEHICLE_STATUS_LABELS[s]),
    datasets: [
      {
        data: statusCounts,
        backgroundColor: VEHICLE_STATUS_COLORS,
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      },
    ],
  };

  const vehiclePieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#595959",
          font: { size: 11 },
          padding: 12,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) => {
            const total = statusCounts.reduce((a, b) => a + b, 0);
            const val = ctx.raw as number;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
            return ` ${ctx.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  const totalVehiclesShown = statusCounts.reduce((a, b) => a + b, 0);

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
      {/* Page title */}
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#141414" }}>
        Tổng quan hệ thống
      </h1>

      {/* ───── Stat cards ───── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard
          title="Tổng người dùng"
          value={loading ? "..." : usersTotal.toLocaleString("vi-VN")}
          badge="70.5%"
          positive={true}
          subtext="Tăng thêm"
          highlight={loading ? "" : Math.round(usersTotal * 0.12).toLocaleString("vi-VN")}
          loading={loading}
        />
        <StatCard
          title="Tổng vật tư"
          value={loading ? "..." : suppliesTotal.toLocaleString("vi-VN")}
          badge="27.4%"
          positive={false}
          subtext="Tăng thêm"
          highlight={loading ? "" : Math.round(suppliesTotal * 0.08).toLocaleString("vi-VN")}
          loading={loading}
        />
        <StatCard
          title="Tổng phương tiện"
          value={loading ? "..." : vehiclesTotal.toLocaleString("vi-VN")}
          badge="59.3%"
          positive={true}
          subtext="Tăng thêm"
          highlight={loading ? "" : Math.round(vehiclesTotal * 0.15).toLocaleString("vi-VN")}
          loading={loading}
        />
        <StatCard
          title="Tổng kho"
          value={loading ? "..." : warehouseTotal.toLocaleString("vi-VN")}
          badge="27.4%"
          positive={false}
          subtext="Tăng thêm"
          highlight={loading ? "" : Math.round(warehouseTotal * 0.1).toLocaleString("vi-VN")}
          loading={loading}
        />
      </div>

      {/* ───── Middle row: Area chart + Pie chart ───── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {/* Unique Visitor chart */}
        <div
          style={{
            flex: "1 1 55%",
            background: "#fff",
            borderRadius: "8px",
            padding: "20px 24px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            minWidth: "300px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#141414", margin: 0 }}>
              Số lượng vật tư và phương tiện
            </h2>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["month", "week"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setVisitorPeriod(p)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: visitorPeriod === p ? "#1890ff" : "transparent",
                    color: visitorPeriod === p ? "#fff" : "#8c8c8c",
                    transition: "all 0.2s",
                  }}
                >
                  {p === "week" ? "Tuần" : "Tháng"}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#595959" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#1890ff", display: "inline-block" }} />
              Vật tư
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#595959" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#52c41a", display: "inline-block" }} />
              Phương tiện
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#595959" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fa8c16", display: "inline-block" }} />
              Kho
            </span>
          </div>

          <div style={{ height: "240px" }}>
            <Line data={visitorChartData} options={visitorChartOptions} />
          </div>
        </div>

        {/* Vehicle Status Pie Chart */}
        <div
          style={{
            flex: "1 1 30%",
            background: "#fff",
            borderRadius: "8px",
            padding: "20px 24px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            minWidth: "220px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#141414", marginBottom: "4px", margin: "0 0 4px 0" }}>
            Hoạt động phương tiện
          </h2>
          <p style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "12px" }}>Phân loại theo trạng thái</p>

          {loading ? (
            <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#bfbfbf" }}>
              Đang tải...
            </div>
          ) : totalVehiclesShown === 0 ? (
            <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#bfbfbf", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "32px" }}>🚗</span>
              <span style={{ fontSize: "13px" }}>Chưa có dữ liệu phương tiện</span>
            </div>
          ) : (
            <>
              <div style={{ height: "200px" }}>
                <Pie data={vehiclePieData} options={vehiclePieOptions} />
              </div>
              {/* Status summary pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                {statusOrder.map((s, i) => (
                  <span
                    key={s}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: VEHICLE_STATUS_COLORS[i] + "22",
                      color: VEHICLE_STATUS_COLORS[i],
                    }}
                  >
                    {VEHICLE_STATUS_LABELS[s]}: {statusCounts[i]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ───── Bottom row: Bar chart tổng + Bar chart summary + Quick Links ───── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {/* Bar chart tổng data */}
        <div
          style={{
            flex: "1 1 55%",
            background: "#fff",
            borderRadius: "8px",
            padding: "20px 24px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            minWidth: "300px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#141414", marginBottom: "4px" }}>
            Tổng hợp dữ liệu hệ thống
          </h2>
          <p style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "16px" }}>
            Tổng số theo từng loại dữ liệu
          </p>
          <div style={{ height: "200px" }}>
            {loading ? (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#bfbfbf" }}>
                Đang tải...
              </div>
            ) : (
              <Bar data={summaryBarData} options={summaryBarOptions} />
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div
          style={{
            flex: "1 1 30%",
            background: "#fff",
            borderRadius: "8px",
            padding: "20px 24px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            minWidth: "220px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#141414", marginBottom: "16px" }}>
            Báo cáo phân tích
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Quản lý người dùng", icon: "👥", href: "/admin-users", color: "#1890ff", bg: "#e6f7ff" },
              { label: "Cấu hình hệ thống", icon: "⚙️", href: "/admin-system", color: "#722ed1", bg: "#f9f0ff" },
              { label: "Báo cáo & Giám sát", icon: "📊", href: "/admin-monitoring", color: "#52c41a", bg: "#f6ffed" },
              { label: "Quản lý kho", icon: "🏭", href: "/admin-warehouse", color: "#fa8c16", bg: "#fff7e6" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: item.bg,
                  borderRadius: "6px",
                  textDecoration: "none",
                  color: item.color,
                  fontWeight: 600,
                  fontSize: "13px",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  {item.label}
                </span>
                <span style={{ fontSize: "16px" }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Recent Activity ───── */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "20px 24px",
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#141414", marginBottom: "16px" }}>
          Hoạt động gần đây
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
              {["#", "Hoạt động", "Vị trí", "Trạng thái", "Thời gian"].map((h) => (
                <th
                  key={h}
                  style={{ textAlign: "left", padding: "8px 12px", color: "#8c8c8c", fontWeight: 600, fontSize: "12px" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: "001", action: "Xuất vật tư cứu hộ", location: "Hà Nội", status: "Hoàn thành", time: "10 phút" },
              { id: "002", action: "Điều phối phương tiện", location: "TP.HCM", status: "Đang xử lý", time: "25 phút" },
              { id: "003", action: "Nhập kho thiết bị", location: "Đà Nẵng", status: "Hoàn thành", time: "1 giờ" },
              { id: "004", action: "Cứu hộ khẩn cấp", location: "Huế", status: "Chờ duyệt", time: "2 giờ" },
              { id: "005", action: "Phân phối lương thực", location: "Cần Thơ", status: "Hoàn thành", time: "3 giờ" },
            ].map((row, idx) => {
              const statusColor =
                row.status === "Hoàn thành"
                  ? { bg: "#f6ffed", color: "#52c41a" }
                  : row.status === "Đang xử lý"
                  ? { bg: "#e6f7ff", color: "#1890ff" }
                  : { bg: "#fff7e6", color: "#fa8c16" };
              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid #fafafa",
                    background: idx % 2 === 0 ? "#fff" : "#fafafa",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "10px 12px", color: "#8c8c8c" }}>{row.id}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>{row.action}</td>
                  <td style={{ padding: "10px 12px", color: "#595959" }}>{row.location}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        background: statusColor.bg,
                        color: statusColor.color,
                        borderRadius: "4px",
                        padding: "2px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#8c8c8c" }}>{row.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}