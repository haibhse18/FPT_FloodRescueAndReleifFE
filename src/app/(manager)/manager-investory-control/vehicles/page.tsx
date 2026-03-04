"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/modules/inventory/infrastructure/inventory.api";
import { Table } from "@/shared/ui/components";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";

// use the shared domain type for consistency with API
import type { InventoryItem } from "@/modules/inventory/domain/inventory.entity";

export default function InventoryStockPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchData = async (searchKeyword = "") => {
    setLoading(true);
    try {
      const query = searchKeyword
        ? `?keyword=${encodeURIComponent(searchKeyword)}`
        : "";

      const data = await inventoryApi.getItems(query);
        setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData(keyword);
  };

  const handleClear = () => {
    setKeyword("");
    fetchData();
  };


  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Danh sách vật tư</h1>
        {/* <p className="text-gray-400">Có {items.length} vật tư</p> */}
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
      {/* <Table columns={columns} data={items} striped hoverable /> */}
        </div>
      )}
    </div>
  );
}