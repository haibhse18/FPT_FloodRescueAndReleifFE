"use client";

import { useState, useEffect } from "react";
import { User } from "@/modules/auth/domain/user.entity";
import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import { GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";
import {Table } from "@/shared/ui/components/Table";
import { adminApi } from "../../infrastructure/admin.api";

const getListUserUseCase = new GetListUserUseCase(adminRepository);

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");


  const roleColors: Record<string, string> = {
    Admin: "bg-red-500/20 text-red-400 border border-red-500/40",
    Manager: "bg-purple-500/20 text-purple-400 border border-purple-500/40",
    "Rescue Coordinator": "bg-blue-500/20 text-blue-400 border border-blue-500/40",
    "Rescue Team": "bg-green-500/20 text-green-400 border border-green-500/40",
    Citizen: "bg-gray-500/20 text-gray-300 border border-gray-500/40",
  };

  const fetchUsers = async (searchKeyword = "", pageNumber = 1) => {
    setLoading(true);
  
    try {
     const query =
    `?page=${pageNumber}&limit=10` +
    (searchKeyword ? `&search=${encodeURIComponent(searchKeyword)}` : "");
  
      const res = await adminApi.getListUsers(query);
  
      setUsers(res.data || []);
      setPage(res.meta?.page || 1);
      setTotalPages(res.meta?.totalPages || 1);
  
    } catch (error) {
      console.error("Fetch supplies error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(keyword, page);
  }, [page, keyword]);

  // FILTER
 const handleSearch = () => {
  setPage(1);
  fetchUsers(keyword, 1);
};

  // ACTIONS
  const handleDeleteUser = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa user này?")) {
      setUsers(users.filter((u: any) => u.id !== id));
    }
  };

  const handleToggleStatus = (id: string, status: string) => {
    const newStatus = status === "khoa tai khoan" ? "online" : "khoa tai khoan";

    setUsers(
      users.map((u: any) =>
        u.id === id ? { ...u, status: newStatus } : u
      )
    );
  };
//---------------Update role------------------
 const handleEditUser = (role: string) => { console.log("Edit user:", role); };

  // TABLE COLUMNS
  const columns = [
    {
      key: "user",
      header: "User",
      render: (user: any) => (
        <div>
          <div className="font-medium text-white">
            {user.displayName || user.userName}
          </div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
     render: (user: any) => {
  const color =
    roleColors[user.role] ||
    "bg-gray-500/20 text-gray-300 border border-gray-500/40";

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${color}`}>
      {user.role}
    </span>
  );
},
    },
    {
      key: "isActive",
      header: "Status",
      render: (user: any) =>
        user.status === "khoa tai khoan"
          ? "🔴 Locked"
          : "🟢 Active",
    },
    {
      key: "isAction",
      header: "Actions",
      render: (user: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditUser(user.role)}
            className="text-blue-400"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleStatus(user.id, user.status)}
            className="text-yellow-400"
          >
            🔒
          </button>

          <button
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-400"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-white">
        Quản lý người dùng
      </h1>

      {/* FILTER */}

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

      {/* TABLE */}

      {loading ? (
        <div className="text-center py-20 text-white">
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
</div>
) : users.length === 0 ? (
  <div className="text-center py-20 text-white bg-white/5 rounded-lg">
    <p>Không tìm thấy vật tư nào</p>
  </div>
) : (
  <div className="bg-white/5 rounded-lg overflow-hidden text-white">
    <Table columns={columns} data={users} striped hoverable />
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