"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "chart.js/auto";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), { ssr: false });
const Doughnut = dynamic(() => import("react-chartjs-2").then((mod) => mod.Doughnut), { ssr: false });

export default function AdminMonitoringPage() {
  const [dateRange, setDateRange] = useState("7days");
  const [region, setRegion] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type: "pdf" | "excel") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Đã xuất báo cáo định dạng ${type.toUpperCase()} thành công!`);
    }, 1500);
  };

  // Mock Data for Charts
  const taskChartData = {
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
    datasets: [
      {
        label: "Nhiệm vụ hoàn thành",
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Nhiệm vụ mới",
        data: [15, 22, 18, 20, 35, 25, 20],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const vehicleChartData = {
    labels: ["Đang hoạt động", "Sẵn sàng", "Bảo trì", "Hỏng hóc"],
    datasets: [
      {
        data: [45, 25, 10, 5],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const supplyChartData = {
    labels: ["Thực phẩm", "Nước uống", "Thuốc men", "Khác"],
    datasets: [
      {
        label: "Số lượng (Đơn vị)",
        data: [5000, 8000, 1200, 300],
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)",
          "rgba(56, 189, 248, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderRadius: 4,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#e5e7eb" } },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const, labels: { color: "#e5e7eb" } },
    },
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Báo cáo & Giám sát</h1>
          <p className="text-gray-400 mt-1">Tổng hợp dữ liệu hoạt động cứu hộ, cứu trợ</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-[#0d2232] border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="all">Toàn quốc</option>
            <option value="north">Miền Bắc</option>
            <option value="central">Miền Trung</option>
            <option value="south">Miền Nam</option>
          </select>

          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#0d2232] border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="year">Năm nay</option>
          </select>

          <div className="flex gap-2 ml-auto md:ml-2">
            <button 
              onClick={() => handleExport("excel")}
              disabled={isExporting}
              className="bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              📊 Excel
            </button>
            <button 
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              📄 PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">🚨 Tổng Lượt Cứu Hộ</div>
          <div className="text-3xl font-bold text-white mb-2">1,245</div>
          <div className="text-xs text-green-400">↑ 12% so với tuần trước</div>
        </div>
        
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">📦 Đã Phân Phối</div>
          <div className="text-3xl font-bold text-white mb-2">14,500</div>
          <div className="text-xs text-green-400">↑ Đơn vị hàng hóa</div>
        </div>

        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">👥 Nhân Sự Tham Gia</div>
          <div className="text-3xl font-bold text-white mb-2">850</div>
          <div className="text-xs text-blue-400">Đang hoạt động</div>
        </div>

        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">⏱️ Tốc Độ Phản Hồi</div>
          <div className="text-3xl font-bold text-white mb-2">45p</div>
          <div className="text-xs text-orange-400">Trung bình mỗi vụ</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Line Chart */}
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">📈 Xu Hướng Nhiệm Vụ Cứu Hộ</h2>
          <div className="h-[300px]">
            <Line data={taskChartData} options={commonOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Thống Kê Hàng Cứu Trợ Tồn Kho</h2>
          <div className="h-[300px]">
            <Bar data={supplyChartData} options={commonOptions} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doughnut Chart */}
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">🚑 Trạng Thái Phương Tiện</h2>
          <div className="h-[250px]">
            <Doughnut data={vehicleChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Top Teams Table */}
        <div className="bg-[#1a3a54] p-5 rounded-xl border border-gray-700/50 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">🏆 Hiệu Suất Đội Cứu Hộ Nổi Bật</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700/50">
                  <th className="pb-3 font-medium">Tên Đội</th>
                  <th className="pb-3 font-medium">Khu Vực</th>
                  <th className="pb-3 font-medium">Nhiệm Vụ Hoàn Thành</th>
                  <th className="pb-3 font-medium">Đánh Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 text-white">
                <tr>
                  <td className="py-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex flex-center items-center justify-center font-bold">R1</div> Rescue Team Alpha</td>
                  <td className="py-3 text-gray-300">Lào Cai</td>
                  <td className="py-3">142</td>
                  <td className="py-3 text-yellow-400">⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td className="py-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex flex-center items-center justify-center font-bold">R2</div> Delta Force</td>
                  <td className="py-3 text-gray-300">Yên Bái</td>
                  <td className="py-3">98</td>
                  <td className="py-3 text-yellow-400">⭐⭐⭐⭐½</td>
                </tr>
                <tr>
                  <td className="py-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex flex-center items-center justify-center font-bold">R3</div> Local Support T1</td>
                  <td className="py-3 text-gray-300">Hà Nội</td>
                  <td className="py-3">75</td>
                  <td className="py-3 text-yellow-400">⭐⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
