"use client";

import Link from "next/link";

export default function InventoryIndexPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Quản lý tồn kho
      </h1>
      <div className="space-y-3">
        <Link
          href="equipments"
          className="block px-6 py-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          📦 Vật tư
        </Link>
        <Link
          href="vehicles"
          className="block px-6 py-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          🚗 Phương tiện
        </Link>
      </div>
    </div>
  );
}
