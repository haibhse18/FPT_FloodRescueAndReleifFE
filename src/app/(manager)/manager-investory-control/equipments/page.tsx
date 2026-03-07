"use client";

import { useEffect, useState } from "react";
import { Button, Table } from "@/shared/ui/components";

import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";
import type { Supply } from "@/modules/supplies/domain/supply.entity";

// the page was originally for equipments; repurposed to show supplies

export default function SupplyListPage() {
  const [allItems, setAllItems] = useState<Supply[]>([]);
  const [items, setItems] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const fetchData = async () => {
  setLoading(true);
  try {
    const data = await supplyApi.getSupplies();
    setAllItems(data);
    setItems(data);
  } catch (err) {
    console.error("Failed to load supplies:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchData();
}, []);

 const handleSearch = () => {
  const filtered = allItems.filter((item) =>
    item.name.toLowerCase().includes(keyword.toLowerCase())
  );
  setItems(filtered);
};

 

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Tên" },
    { key: "category", header: "Loại" },
    { key: "unit", header: "Đơn vị" },
    { key: "unitWeight", header: "Trọng lượng/đơn vị" },
    { key: "status", header: "Trạng thái" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Danh sách vật tư</h1>
        <p className="text-gray-400">Có {items.length} vật tư</p>
      </div>
{/* ->> Search: gắn thêm API vào đây */}
     <div className="flex items-center gap-3 max-w-2xl">
  <div className="relative flex-1">
    <input
      type="text"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="Tìm kiếm theo tên, ID hoặc loại..."
      className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>

  <button
    onClick={handleSearch}
    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-md"
  >
    Search
  </button>
</div>

      {loading ? (
        <div className="text-center py-20 text-white">
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
</div>
) : items.length === 0 ? (
  <div className="text-center py-20 text-white bg-white/5 rounded-lg">
    <p>Không tìm thấy vật tư nào</p>
  </div>
) : (
  <div className="bg-white/5 rounded-lg overflow-hidden text-white">
    <Table columns={columns} data={items} striped hoverable />
  </div>
      )}
    </div>
  );
}
