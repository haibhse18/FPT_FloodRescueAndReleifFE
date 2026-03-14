"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "chart.js/auto";

import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { GetSupplyRequestsUseCase } from "@/modules/supplies/application/getSupplyRequests.usecase";

import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";

import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import { GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getSupplyRequestsUseCase = new GetSupplyRequestsUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
const getListUserUseCase = new GetListUserUseCase(adminRepository);

export default function ManagerDashboardPage() {

  const [usersTotal, setUsersTotal] = useState(0);
  const [suppliesTotal, setSuppliesTotal] = useState(0);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [requestsTotal, setRequestsTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {

    setLoading(true);

    try {
      const [suppliesRes, vehiclesRes, usersRes] =
        await Promise.all([
          getSuppliesUseCase.execute(),
          getVehiclesUseCase.execute(),
          getListUserUseCase.execute(),
        ]);

      setSuppliesTotal(suppliesRes?.length ?? 0);
      setVehiclesTotal(vehiclesRes?.total ?? 0);
      setUsersTotal(usersRes?.length ?? 0);

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
    labels: ["Người dùng", "Vật tư", "Phương tiện", "Requests"],
    datasets: [
      {
        label: "Thống kê hệ thống",
        data: [usersTotal, suppliesTotal, vehiclesTotal, requestsTotal],
        backgroundColor: [
          "rgba(59,130,246,0.8)",
          "rgba(16,185,129,0.8)",
          "rgba(251,146,60,0.9)",
          "rgba(236,72,153,0.85)",
        ],
        borderRadius: 10,
        barThickness: 70,
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">👤 Tổng người dùng</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : usersTotal}
          </p>
        </div>

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