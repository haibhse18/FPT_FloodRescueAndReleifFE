"use client";

import { useState, useEffect } from "react";
import { User } from "@/modules/auth/domain/user.entity";
import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import { GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";
import { Table } from "@/shared/ui/components/Table";
import { adminApi } from "../../infrastructure/admin.api";

const getListUserUseCase = new GetListUserUseCase(adminRepository);

const ROLE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Admin:                { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
  Manager:              { bg: "#f9f0ff", color: "#722ed1", border: "#d3adf7" },
  "Rescue Coordinator": { bg: "#e6f7ff", color: "#096dd9", border: "#91d5ff" },
  "Rescue Team":        { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
  Citizen:              { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");

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
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(keyword, page);
  }, [page, keyword]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(keyword, 1);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa user này?")) {
      setUsers(users.filter((u: any) => u.id !== id));
    }
  };

  const handleToggleStatus = (id: string, status: string) => {
    const newStatus = status === "khoa tai khoan" ? "online" : "khoa tai khoan";
    setUsers(users.map((u: any) => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const handleEditUser = (role: string) => {
    console.log("Edit user:", role);
  };

  const columns = [
    {
      key: "user",
      header: "Người dùng",
      render: (user: any) => (
        <div>
          <div style={{ fontWeight: 600, color: "#141414", fontSize: "14px" }}>
            {user.displayName || user.userName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "2px" }}>{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      render: (user: any) => {
        const s = ROLE_STYLE[user.role] ?? { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" };
        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`,
            }}
          >
            {user.role}
          </span>
        );
      },
    },
    {
      key: "isActive",
      header: "Trạng thái",
      render: (user: any) =>
        user.status === "khoa tai khoan" ? (
          <span
            style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: "#fff1f0",
              color: "#cf1322",
              border: "1px solid #ffa39e",
            }}
          >
            Đã khoá
          </span>
        ) : (
          <span
            style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: "#f6ffed",
              color: "#389e0d",
              border: "1px solid #b7eb8f",
            }}
          >
            Hoạt động
          </span>
        ),
    },
    {
      key: "isAction",
      header: "Hành động",
      render: (user: any) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => handleEditUser(user.role)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            title="Sửa"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleStatus(user.id, user.status)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            title="Khoá/Mở"
          >
            🔒
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            title="Xoá"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px 28px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#f5f6fa",
        minHeight: "100vh",
        color: "#141414",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#141414", margin: 0 }}>
            Danh sách người dùng
          </h1>
          <p style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "4px" }}>
            Có <strong>{usersTotal}</strong> người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#fff",
          borderRadius: "8px",
          padding: "14px 20px",
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Tìm kiếm theo tên, email..."
          style={{
            flex: 1,
            maxWidth: "360px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #d9d9d9",
            fontSize: "13px",
            color: "#141414",
            background: "#fafafa",
            outline: "none",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: "none",
            background: "#1890ff",
            color: "#fff",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#096dd9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1890ff")}
        >
          Tìm kiếm
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            padding: "60px",
            textAlign: "center",
            color: "#8c8c8c",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #f0f0f0",
              borderTop: "3px solid #1890ff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          Đang tải...
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            padding: "60px",
            textAlign: "center",
            color: "#8c8c8c",
            fontSize: "14px",
          }}
        >
          Không tìm thấy người dùng nào
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Table columns={columns} data={users} striped={true} hoverable={true} />
        </div>
      )}

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginTop: "20px",
        }}
      >
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: "1px solid #d9d9d9",
            background: "#fff",
            color: "#595959",
            fontWeight: 500,
            fontSize: "13px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
          }}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: page === i + 1 ? "none" : "1px solid #d9d9d9",
              background: page === i + 1 ? "#1890ff" : "#fff",
              color: page === i + 1 ? "#fff" : "#595959",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: "1px solid #d9d9d9",
            background: "#fff",
            color: "#595959",
            fontWeight: 500,
            fontSize: "13px",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
          }}
        >
          Next
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}