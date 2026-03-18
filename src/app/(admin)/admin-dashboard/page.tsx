"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "chart.js/auto";

import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";

import { vehicleRepository } from "@/modules/vehicles/infrastructure/vehicles.repository.impl";
import { GetVehiclesUseCase } from "@/modules/vehicles/application/getVehicles.usecase";

import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import {GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";

import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import { GetWarehouseUseCase } from "@/modules/warehouse/application/getWarehouse.usecase";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
const getListUserUseCase = new GetListUserUseCase(adminRepository);
const getWarehouseUseCase = new GetWarehouseUseCase(warehouseRepository);

export default function ManagerDashboardPage() {

  const [usersTotal, setUsersTotal] = useState(0);
  const [suppliesTotal, setSuppliesTotal] = useState(0);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [warehouseTotal, setWarehouseTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {

    setLoading(true);

    try {
      const [suppliesRes, vehiclesRes, usersRes, warehouseRes] =
        await Promise.all([
          getSuppliesUseCase.execute(),
          getVehiclesUseCase.execute(),
          getListUserUseCase.execute(),
          getWarehouseUseCase.execute(),
        ]);

      setSuppliesTotal(suppliesRes.meta?.total ?? 0);
      setVehiclesTotal(vehiclesRes.total ?? 0);
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

  const chartData = {
    labels: ["Người dùng", "Vật tư", "Phương tiện", "Kho"],
    datasets: [
      {
        label: "Thống kê hệ thống",
        data: [usersTotal, suppliesTotal, vehiclesTotal, warehouseTotal],
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
          <p className="text-gray-400 text-sm mb-2">Tổng người dùng</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : usersTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Tổng vật tư</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : suppliesTotal}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Tổng phương tiện</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : vehiclesTotal}
          </p>
        </div>

         <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Tổng kho</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : warehouseTotal}
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

      {/* Quick Links / Navigation */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin-users" className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 p-4 rounded-lg flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <span className="font-semibold">Quản lý người dùng</span>
          </div>
          <span>→</span>
        </a>
        
        <a href="/admin-system" className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/30 p-4 rounded-lg flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <span className="font-semibold">Cấu hình hệ thống</span>
          </div>
          <span>→</span>
        </a>

        <a href="/admin-monitoring" className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 p-4 rounded-lg flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span className="font-semibold">Báo cáo & Giám sát</span>
          </div>
          <span>→</span>
        </a>
      </div>

    </div>
  );
}