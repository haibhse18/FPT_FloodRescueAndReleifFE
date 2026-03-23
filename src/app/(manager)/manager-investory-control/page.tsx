"use client";

import Link from "next/link";

export default function InventoryIndexPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quản lý tồn kho
      </h1>
      <div className="space-y-4">
        <Link
          href="equipments"
          className="block px-6 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all text-gray-800 font-medium group"
        >
          <span className="text-xl mr-3 group-hover:scale-110 inline-block transition-transform">📦</span> Vật tư
        </Link>
        <Link
          href="vehicles"
          className="block px-6 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all text-gray-800 font-medium group"
        >
          <span className="text-xl mr-3 group-hover:scale-110 inline-block transition-transform">🚗</span> Phương tiện
        </Link>
      </div>
    </div>
  );
}
