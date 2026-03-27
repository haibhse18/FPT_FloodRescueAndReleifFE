"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "chart.js/auto";

import { Supply } from "@/modules/supplies/domain/supply.entity";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { GetSupplyRequestsUseCase } from "@/modules/supplies/application/getSupplyRequests.usecase";

import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";
import { Vehicle, vehicleApi } from "@/modules/vehicles";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});
const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getSupplyRequestsUseCase = new GetSupplyRequestsUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
interface StatCardProps {
  title: string;
  value: string | number;
  positive?: boolean;
  loading: boolean;
  accentColor: string;
}
function StatCard({ title, value, positive = true, loading, accentColor }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "20px 24px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${accentColor}`,
        flex: 1,
      }}
    >
      <p style={{ fontSize: "13px", color: "#8c8c8c", marginBottom: "8px", fontWeight: 500 }}>{title}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span style={{ fontSize: "26px", fontWeight: 700, color: "#141414", letterSpacing: "-0.5px" }}>
          {loading ? "..." : value}
        </span>
      </div>
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

export default function ManagerDashboardPage() {

  const [suppliesTotal, setSuppliesTotal] = useState(0);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [requestsProcessing, setRequestsProcessing] = useState(0);
 
  const [loading, setLoading] = useState(true);
   
  const [vehicleStats, setVehicleStats]           = useState({
    total: 0, active: 0, in_use: 0, maintenance: 0, out_of_service: 0,
  });
  const [allVehicleItems, setAllVehicleItems]     = useState<Vehicle[]>([]);

  const fetchData = async () => {

    setLoading(true);

    try {

      const [suppliesRes, requestsRes, vehiclesRes] =
        await Promise.all([
          getSuppliesUseCase.execute(),
          getSupplyRequestsUseCase.execute(),
          getVehiclesUseCase.execute(),
        ]);

      setSuppliesTotal(suppliesRes.meta?.total ?? 0);

      setRequestsProcessing(requestsRes.length?? 0);

      setVehiclesTotal(vehiclesRes?.total ?? 0);

    } catch (err) {

      console.error("Dashboard error:", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
     fetchVehicleStats();
  }, []);

  const chartData = {
    labels: ["Vật tư", "Phương tiện", "Yêu cầu đang xử lý"],
    datasets: [
      {
        label: "Thống kê hệ thống",
        data: [suppliesTotal, vehiclesTotal, requestsProcessing],
        backgroundColor: [
          "#1890ff", // emerald-600
          "#52c41a", // emerald-700
          "#fa8c16", // emerald-500
        ],
        borderRadius: 12,
        barThickness: 60,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to match clean UI
      },
    },
    scales: {
      x: {
        ticks: { color: "#6B7280", font: { weight: 'bold' } }, // gray-500
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#9CA3AF" }, // gray-400
        grid: { color: "#F3F4F6", borderDash: [5, 5] }, // gray-100 dashed
        border: { display: false },
      },
    },
  };

  const statusOrder = ["ACTIVE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"];
    
  
    const vehiclePieData = {
      labels: statusOrder.map((s) => VEHICLE_STATUS_LABELS[s]),
      datasets: [
        {
          data: [vehicleStats.active, vehicleStats.in_use, vehicleStats.maintenance, vehicleStats.out_of_service],
          backgroundColor: VEHICLE_STATUS_COLORS,
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 6,
        },
      ],
    };
     const fetchVehicleStats = async () => {
        try {
          const res = await vehicleApi.getVehicles("?page=1&limit=100000");
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
              const total = vehicleStats.total;
              const val = ctx.raw as number;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
              return ` ${ctx.label}: ${val} (${pct}%)`;
            },
          },
        },
      },
    };
  
    const totalVehiclesShown = vehicleStats.total;
  

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

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Lên kế hoạch, ưu tiên và hoàn thành các nhiệm vụ dễ dàng.</p>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard
          title="Tổng Vật tư"
          value={loading ? "..." : suppliesTotal.toLocaleString("vi-VN")}
          positive={true}
          loading={loading}
          accentColor="#1890ff"
        />
        <StatCard
          title="Tổng phương tiện"
          value={loading ? "..." : vehiclesTotal.toLocaleString("vi-VN")}
          positive={false}
          loading={loading}
          accentColor="#fa8c16"
        />
        <StatCard
          title="Tổng yêu cầu"
          value={loading ? "..." : requestsProcessing.toLocaleString("vi-VN")}
          positive={true}
          loading={loading}
          accentColor="#1890ff"
        />
      </div>

      {/* Chart */}
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
              <Bar data={chartData} options={chartOptions as any} />
            )}
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
                    {VEHICLE_STATUS_LABELS[s]}: {[vehicleStats.active, vehicleStats.in_use, vehicleStats.maintenance, vehicleStats.out_of_service][i]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}