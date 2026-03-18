"use client";

import { useEffect, useState } from "react";
import { Button, Table } from "@/shared/ui/components";
import * as XLSX from "xlsx";
import { supplyApi } from "@/modules/supplies/infrastructure/supply.api";
import type { Supply, SupplyStatus } from "@/modules/supplies/domain/supply.entity";

import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
// the page was originally for equipments; repurposed to show supplies

const STATUS_MAP: Record<SupplyStatus, { label: string; color: string }> = {
  SUBMITTED:         { label: "Sẵn sàng",        color: "border border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5" },
  CANCELLED:       { label: "Đã hủy",    color: "border border-amber-400   text-amber-400   bg-amber-400/10   rounded-full px-2 py-0.5" },
  CLOSED:   { label: "Đã đóng", color: "border border-red-400     text-red-400     bg-red-400/10     rounded-full px-2 py-0.5" },
};


export default function SupplyListPage() {
  const [items, setItems] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
const [file, setFile] = useState<File | null>(null);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
 const [suppliesTotal, setSuppliesTotal] = useState(0);

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);


const fetchSupplies = async (searchKeyword = "", pageNumber = 1) => {
  setLoading(true);

  try {
   const query =
  `?page=${pageNumber}&limit=10` +
  (searchKeyword ? `&name=${encodeURIComponent(searchKeyword)}` : "");

    const res = await supplyApi.getSupplies(query);

    setItems(res.data || []);
    setPage(res.meta?.page || 1);
    setTotalPages(res.meta?.totalPages || 1);

  } catch (error) {
    console.error("Fetch supplies error:", error);
  } finally {
    setLoading(false);
  }

  const [suppliesRes] =
        await Promise.all([
          getSuppliesUseCase.execute(),
        ]);

      setSuppliesTotal(suppliesRes.meta?.total ?? 0);

};

  useEffect(() => {
    fetchSupplies(keyword, page);
  }, [page, keyword]);

 const handleSearch = () => {
  setPage(1);
  fetchSupplies(keyword, 1);
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;

  setFile(selectedFile);
};

const handleImportExcel = async () => {
  if (!file) {
    alert("Vui lòng chọn file Excel");
    return;
  }

  try {
    await supplyApi.importExcel(file);

    alert("Import Excel thành công");

    fetchSupplies(keyword, page); // reload table
  } catch (error) {
    console.error(error);
    alert("Import thất bại");
  }
};
  const columns = [
    { key: "name", header: "Tên" },
    { key: "category", header: "Loại" },
    { key: "unit", header: "Đơn vị" },
    { key: "unitWeight", header: "Trọng lượng" },
    {
          key: "status",
          header: "Trạng thái",
          render: (row: Supply) => {
            const s = STATUS_MAP[row.status as SupplyStatus];
                   return s
                     ? <span className={`inline-flex text-xs font-medium ${s.color}`}>{s.label}</span>
                     : row.status;
                 }
        },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Danh sách vật tư</h1>
        <p className="text-gray-400">Có {suppliesTotal} vật tư</p>
      </div>
{/* ->> Search: gắn thêm API vào đây */}
<div className="flex items-center justify-between">

  {/* LEFT - Search */}
  <div className="flex items-center gap-3">
    <div className="relative w-80">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm kiếm theo tên, ID hoặc loại..."
        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
      />
    </div>

    <button
      onClick={handleSearch}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
    >
      Search
    </button>
  </div>

  {/* RIGHT - Import Excel */}
  <div className="flex items-center gap-3">

    <label className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition">
      📁 Chọn file
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>

    {file && (
      <span className="text-green-400 text-sm bg-green-400/10 px-3 py-1 rounded">
        {file.name}
      </span>
    )}

    <button
      onClick={handleImportExcel}
      disabled={!file}
      className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
    >
      ⬆ Import
    </button>

  </div>

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

      
      <div className="flex justify-center items-center gap-2 mt-6">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setPage(i + 1)}
      className={`px-3 py-1 rounded ${
        page === i + 1
          ? "bg-blue-600 text-white"
          : "bg-white/10 text-white"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
  >
    Next
  </button>

</div>
    </div>
  );
}
