"use client";

import StatusTimeline from "@/app/components/citizen/StatusTimeline";
import { Phone } from "lucide-react";

export default function StatusPage() {
  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* HEADER */}
      <h1 className="text-lg font-bold mb-1">📍 Trạng thái xử lý</h1>
      <p className="text-sm text-gray-600 mb-4">
        Theo dõi tiến trình hỗ trợ của bạn
      </p>

      {/* PROGRESS */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ</span>
          <span>50%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div className="h-full w-1/2 bg-blue-600 rounded-full" />
        </div>
      </div>

      {/* TIMELINE */}
      <StatusTimeline />

      {/* HOTLINE */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
          <Phone size={16} />
          Hotline khẩn cấp: 112
        </div>
        <p className="text-xs text-red-600 mt-1">
          Gọi ngay nếu tình trạng trở nên nguy hiểm
        </p>
      </div>
    </div>
  );
}
