"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Supply, SupplyRequest } from "@/modules/supplies/domain/supply.entity";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { GetSupplyRequestsUseCase } from "@/modules/supplies/application/getSupplyRequests.usecase";

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getSupplyRequestsUseCase = new GetSupplyRequestsUseCase(supplyRepository);

export default function ManagerDashboardPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
//
const fetchData = async () => {
  setLoading(true);
  try {
    const [suppliesRes, requestsRes] = await Promise.all([
      getSuppliesUseCase.execute(),
      getSupplyRequestsUseCase.execute(),
    ]);

    console.log("Supplies:", suppliesRes);
    console.log("Requests:", requestsRes);

    setSupplies(suppliesRes);
    setRequests(requestsRes);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    console.log("FINALLY RUN");
    setLoading(false);
  }
};

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bảng điều khiển</h1>
        <p className="text-gray-300">
          Chào mừng quản lý. Dưới đây là tóm tắt hệ thống.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">📦 Tổng vật tư</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : supplies.length}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">📋 Yêu cầu đang chờ</p>
          <p className="text-4xl font-bold text-white">
            {loading ? "-" : requests.filter(r => r.status === "IN_PROGRESS").length}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white mb-4">Điều hướng nhanh</h2>
        <Link
          href="/manager-investory-control/equipments"
          className="block px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          📦 Quản lý vật tư
        </Link>
        <Link
          href="/manager-investory-control/vehicles"
          className="block px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
           🚛 Quản lý phương tiện
        </Link>
        <Link
          href="/manager-investory-control/stock"
          className="block px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
        >
          📊 Quản lý tồn kho
        </Link>
      </div>
    </div>
  );
}
