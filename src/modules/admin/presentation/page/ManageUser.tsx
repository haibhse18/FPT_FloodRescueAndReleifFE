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
  const [usersTotal, setUsersTotal] = useState(0);
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
      setUsersTotal(res.meta?.total || 0);
  
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
          <div className="font-bold text-gray-900">
            {user.displayName || user.userName}
          </div>
          <div className="text-sm font-medium text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
     render: (user: any) => {
  const color =
    roleColors[user.role] ||
    "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>
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
          ? <span className="text-red-600 font-bold bg-red-50 border border-red-100 px-3 py-1 rounded-full text-xs">Locked</span>
          : <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs">Active</span>,
    },
    {
      key: "isAction",
      header: "Actions",
      render: (user: any) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleEditUser(user.role)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleStatus(user.id, user.status)}
            className="text-amber-500 hover:text-amber-700 transition-colors"
          >
            🔒
          </button>

          <button
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Danh sách người dùng</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Có {usersTotal} người dùng trong hệ thống</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm theo tên, ID..."
              className="w-full px-6 py-3 rounded-full bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* TABLE */}

      {/* TABLE */}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl shadow-sm border border-gray-100">
          <p>Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
          <Table columns={columns} data={users} striped={true} hoverable={true} />
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-3 mt-6">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium shadow-sm"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`w-10 h-10 rounded-full font-bold shadow-sm flex items-center justify-center transition-colors ${
            page === i + 1
              ? "bg-emerald-700 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium shadow-sm"
      >
        Next
      </button>
      </div>
    </div>
  );
}