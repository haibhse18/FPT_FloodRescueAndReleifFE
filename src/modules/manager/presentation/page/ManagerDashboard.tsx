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

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getSupplyRequestsUseCase = new GetSupplyRequestsUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);

export default function ManagerDashboardPage() {

  const [suppliesTotal, setSuppliesTotal] = useState(0);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [requestsProcessing, setRequestsProcessing] = useState(0);

  const [loading, setLoading] = useState(true);

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

      setRequestsProcessing(requestsRes.meta?.total ?? 0);

      setVehiclesTotal(vehiclesRes?.total ?? 0);

    } catch (err) {

      console.error("Dashboard error:", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = {
    labels: ["Vật tư", "Phương tiện", "Yêu cầu đang xử lý"],
    datasets: [
      {
        label: "Thống kê hệ thống",
        data: [suppliesTotal, vehiclesTotal, requestsProcessing],
        backgroundColor: [
          "#059669", // emerald-600
          "#047857", // emerald-700
          "#10B981", // emerald-500
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

  return (
    <div className="flex flex-col h-full gap-6">

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dashboard Quản Lý</h1>
          <p className="text-sm text-gray-500 mt-1">Lên kế hoạch, ưu tiên và hoàn thành các nhiệm vụ dễ dàng.</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">

        <div className="bg-emerald-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-emerald-100 text-sm font-medium mb-2 relative z-10 flex items-center justify-between">
            <span>Tổng vật tư</span>
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">↗</span>
          </p>
          <p className="text-4xl font-bold text-white relative z-10">
            {loading ? "-" : suppliesTotal}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Tổng phương tiện</span>
            <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">↗</span>
          </p>
          <p className="text-4xl font-bold text-gray-900">
            {loading ? "-" : vehiclesTotal}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Yêu cầu đang xử lý</span>
            <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">↗</span>
          </p>
          <p className="text-4xl font-bold text-gray-900">
            {loading ? "-" : requestsProcessing}
          </p>
        </div>

      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[400px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">

        <h2 className="text-lg font-bold text-gray-900 mb-6 flex-shrink-0">
          Thống kê chi tiết
        </h2>

        {/* Container với chiều cao cụ thể để Chart.js render đúng */}
        <div className="flex-1 min-h-0 relative">
          <Bar data={chartData} options={chartOptions as any} />
        </div>

      </div>

    </div>
  );
}