"use client";

import { useEffect, useState } from "react";
import { User } from "@/modules/auth/domain/user.entity";
import { adminApi } from "@/modules/admin/infrastructure/admin.api";
import { Button, Table } from "@/shared/ui/components";


export default function AdminUsersPage() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [file, setFile] = useState<File | null>(null);

  // fetch user list
  const fetchUsers = async (searchKeyword = "", pageNumber = 1) => {
    setLoading(true);

    try {

      const query =
        `?page=${pageNumber}&limit=10&role=citizen` +
        (searchKeyword
          ? `&name=${encodeURIComponent(searchKeyword)}`
          : "");

      const res = await adminApi.getListUsers(query);

      setUsers(res.data || []);
      setPage(res.meta?.page || 1);
      setTotalPages(res.meta?.totalPages || 1);

    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(keyword, page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(keyword, 1);
  };

  // Excel file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);
  };


  const columns = [
    {
      key: "userName",
      header: "Tên đăng nhập",
      render: (row: User) => row.userName ?? "-"
    },
    {
      key: "displayName",
      header: "Họ và tên",
      render: (row: User) => row.displayName ?? "-"
    },
    {
      key: "email",
      header: "Email",
      render: (row: User) => row.email ?? "-"
    },
    {
      key: "phoneNumber",
      header: "SĐT",
      render: (row: User) => row.phoneNumber ?? "-"
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: User & { status?: string }) => {

        if (row.isActive === false) {
          return "🔴 Khóa tài khoản";
        }

        const statusMap: Record<string, string> = {
          online: "🟢 Online",
          offline: "⚫ Offline",
        };

        const currentStatus = row.status
          ? row.status.toLowerCase()
          : "offline";

        return statusMap[currentStatus] || "-";
      }
    }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Danh sách Citizen
        </h1>
        <p className="text-gray-400">
          Có {users.length} người dùng
        </p>
      </div>

      {/* Search + Import */}
      <div className="flex items-center justify-between">

        {/* Search */}
        <div className="flex items-center gap-3">

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên..."
            className="w-80 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
          />

          <button
            onClick={handleSearch}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </button>

        </div>

      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-white">
          Loading...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-white bg-white/5 rounded-lg">
          Không tìm thấy người dùng
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg overflow-hidden text-white">
          <Table columns={columns} data={users} striped hoverable />
        </div>
      )}

      {/* Pagination */}
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
                ? "bg-blue-600"
                : "bg-white/10"
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