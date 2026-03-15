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

      setSuppliesTotal(suppliesRes.length ?? 0);

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
    <div className="p-4 lg:p-6">

      {/* Quick stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">📦 Tổng vật tư</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : suppliesTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">🚑 Tổng phương tiện</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : vehiclesTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">📋 Yêu cầu đang xử lý</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : requestsProcessing}
          </p>
        </div>

      </div>

      {/* Chart */}

      <div className="bg-white/5 rounded-lg p-6 border border-gray-700">

        <h1 className="text-2xl font-bold text-white mb-6">
          📊 Thống kê hệ thống
        </h1>

        <Bar data={chartData} options={chartOptions} />

      </div>

    </div>
  );
}