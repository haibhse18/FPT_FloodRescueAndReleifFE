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

      setRequestsProcessing(requestsRes.length ?? 0);

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
          "rgba(59,130,246,0.8)",
          "rgba(251,146,60,0.9)",
          "rgba(16,185,129,0.8)",
        ],
        borderRadius: 10,
        barThickness: 80,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="flex flex-col h-screen p-4 lg:p-6 gap-4 overflow-hidden">

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">

        <div className="bg-white/5 rounded-lg p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">📦 Tổng vật tư</p>
          <p className="text-3xl font-bold text-white">
            {loading ? "-" : suppliesTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">🚑 Tổng phương tiện</p>
          <p className="text-3xl font-bold text-white">
            {loading ? "-" : vehiclesTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">📋 Yêu cầu đang xử lý</p>
          <p className="text-3xl font-bold text-white">
            {loading ? "-" : requestsProcessing}
          </p>
        </div>

      </div>

      {/* Chart — flex-1 để chiếm hết phần còn lại, min-h-0 để không overflow */}
      <div className="flex-1 min-h-0 bg-white/5 rounded-lg p-6 border border-gray-700 flex flex-col">

        <h1 className="text-xl font-bold text-white mb-4 flex-shrink-0">
          📊 Thống kê hệ thống
        </h1>

        {/* Container với chiều cao cụ thể để Chart.js render đúng */}
        <div className="flex-1 min-h-0 relative">
          <Bar data={chartData} options={chartOptions} />
        </div>

      </div>

    </div>
  );
}