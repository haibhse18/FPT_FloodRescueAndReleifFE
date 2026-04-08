"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/modules/auth/domain/user.entity";
import { adminRepository } from "@/modules/admin/infrastructure/admin.repository.impl";
import { GetListUserUseCase } from "@/modules/admin/applications/getListUser.usecase";
import { Table } from "@/shared/ui/components/Table";
import { adminApi } from "../../infrastructure/admin.api";
import { ApproveTeamApplicationUseCase } from "@/modules/teams/application/Approve.usecase";
import { RejectTeamApplicationUseCase } from "@/modules/teams/application/Reject.usecase";
import { teamRepository } from "@/modules/teams/infrastructure/team.repository.impl";
import { TeamMember } from "@/modules/teams/domain/team.entity";
import { Check, Trash2, UserPen, X, Lock, Unlock } from "lucide-react";

  const getListUserUseCase = new GetListUserUseCase(adminRepository);
  const approveUseCase = new ApproveTeamApplicationUseCase(teamRepository);
  const rejectUseCase = new RejectTeamApplicationUseCase(teamRepository);

const ROLE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Admin:                { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
  Manager:              { bg: "#f9f0ff", color: "#722ed1", border: "#d3adf7" },
  "Rescue Coordinator": { bg: "#e6f7ff", color: "#096dd9", border: "#91d5ff" },
  "Rescue Team":        { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
  Citizen:              { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"Người Dùng" | "Đơn tình nguyện viên">("Người Dùng");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState<string>("");

  const TAB_CONFIG: { label: "Người Dùng" | "Đơn tình nguyện viên"; color: string }[] = [
    { label: "Người Dùng", color: "#00629D" },
    { label: "Đơn tình nguyện viên", color: "#1890ff" },
  ];

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

  const fetchApplications = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const query = { page: pageNumber, limit: 10, ...(keyword && { search: keyword }) };
      const res = await teamRepository.getAllTeamApplications(query);
      setTeams(res.data || []);
      setPage(res.meta?.page || res.page || 1);
      setTotalPages(res.meta?.totalPages || res.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Người Dùng") {
      fetchUsers(keyword, page);
    } else {
      fetchApplications(page);
    }
  }, [page, keyword, activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "Người Dùng" || tab === "Đơn tình nguyện viên") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSearch = () => {
    setPage(1);
    if (activeTab === "Người Dùng") {
      fetchUsers(keyword, 1);
    } else {
      fetchApplications(1);
    }
  };

  const handleDeleteUser = async (id: string) => {
  if (!confirm("Bạn có chắc muốn xóa user này?")) return;

  try {
    await adminApi.deleteUser(id);
    fetchUsers(keyword, page); // reload lại list từ server
  } catch (err) {
    console.error(err);
  }
};

  const handleToggleStatus = async (id: string, currentIsActive: boolean) => {
  try {
    const actionStatus = currentIsActive === false ? "unban" : "ban";
    // Tuỳ vào backend yêu cầu isActive: boolean hay status: string, ta có thể gửi cả 2 để phòng hờ:
    await adminApi.updateUserStatus(id, actionStatus);
    fetchUsers(keyword, page);
  } catch (err) {
    console.error("Lỗi khi khoá tài khoản:", err);
  }
};


 

  const handleEditUser = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      fetchUsers(keyword, page);
      setEditingRole(null);
    } catch (err: any) {
      console.log("ERROR:", err?.response?.data || err);
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm("Chấp nhận đơn tình nguyện này?")) {
      await approveUseCase.execute(id);
      fetchApplications(page);
      setSelectedApp(null);
    }
  };

  const submitReject = async () => {
    if (!selectedApp || !rejectReason.trim()) return;
    await rejectUseCase.execute(selectedApp._id, rejectReason);
    setShowRejectModal(false);
    setSelectedApp(null);
    setRejectReason("");
    fetchApplications(page);
  };


  const applicationColumns = [
    {
      key: "user",
      header: "Người nộp",
      render: (row: any) => (
        <div>
          <div style={{ fontWeight: 600, color: "#141414" }}>
            {row?.userId?.displayName || row?.userId?.userName || row?.userName || "Không rõ"}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{row?.userId?.email || row?.email || ""}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "SĐT liên hệ",
      render: (row: any) => row?.submittedPhoneNumber || row?.userId?.phoneNumber || row?.phoneNumber || "N/A",
    },
    {
      key: "motivation",
      header: "Lý do tình nguyện",
      render: (row: any) => (
        <div style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.motivation}>
          {row?.motivation || "Không có nội dung"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: any) => {
        const isPending = row.status === "PENDING";
        const isApproved = row.status === "APPROVED";
        return (
          <span style={{
            padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600,
            background: isPending ? "#fff7e6" : isApproved ? "#f6ffed" : "#fff1f0",
            color: isPending ? "#d46b08" : isApproved ? "#389e0d" : "#cf1322"
          }}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: "action",
      header: "Hành động",
      render: (row: any) => (
        <button
          onClick={() => setSelectedApp(row)}
          style={{
            background: "#1890ff", color: "#fff", border: "none",
            padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
          }}
        >
          Xem chi tiết
        </button>
      ),
    },
  ];

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
        const userId = user.id || user._id;
        if (editingRole === userId) {
          return (
            <select
              value={editingRoleValue}
              onChange={(e) => setEditingRoleValue(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
                fontSize: "12px",
                outline: "none",
                background: "#fff",
                color: "#141414",
              }}
            >
              {Object.keys(ROLE_STYLE).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          );
        }

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
        user.isActive === false ? (
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
      render: (user: any) => {
        const userId = user.id || user._id;
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            {editingRole === userId ? (
              <>
                <button
                  onClick={() => handleEditUser(userId, editingRoleValue)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                  title="Lưu"
                >
                   <Check />
                </button>
                <button
                  onClick={() => setEditingRole(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                  title="Hủy"
                >
                  <X />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditingRole(userId);
                  setEditingRoleValue(user.role);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                title="Sửa"
              >
                <UserPen />
              </button>
            )}
            <button
              onClick={() => handleToggleStatus(userId, user.isActive)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", opacity: editingRole === userId ? 0.5 : 1 }}
              disabled={editingRole === userId}
              title={user.isActive === false ? "Mở khoá" : "Khoá tài khoản"}
            >
              {user.isActive === false ? <Unlock style={{ color: "#52c41a" }} /> : <Lock style={{ color: "#f5222d" }} />}
            </button>
            <button
              onClick={() => handleDeleteUser(userId)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", opacity: editingRole === userId ? 0.5 : 1, color: "#f5222d" }}
              disabled={editingRole === userId}
              title="Xoá người dùng"
            >
              <Trash2 />
            </button>
          </div>
        );
      },
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
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#141414", margin: 0 }}>Quản lý người dùng</h1>
        <p style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "4px" }}>
          Quản lý tổng quan người dùng và tình nguyện viên.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "20px",
          background: "#fff",
          borderRadius: "8px 8px 0 0",
          padding: "0 8px",
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {TAB_CONFIG.map(({ label, color }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            style={{
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: activeTab === label ? color : "#8c8c8c",
              borderBottom: activeTab === label ? `2px solid ${color}` : "2px solid transparent",
              marginBottom: "-1px",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Người Dùng */}
      {activeTab === "Người Dùng" && (
        <>
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
      </>
      )}
{/* /*-------------------Don tinh nguyen vien-------------------*/}
      {activeTab === "Đơn tình nguyện viên" && (
         <>
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
      ) : teams.length === 0 ? (
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
          Không tìm thấy đơn tình nguyện viên nào
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
          <Table columns={applicationColumns} data={teams} striped={true} hoverable={true} />
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

      {/* Modal chi tiết đơn */}
      {selectedApp && !showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "450px", maxWidth: "90%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#141414" }}>Chi tiết đơn đăng ký</h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8c8c8c" }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: "12px", fontSize: "14px" }}><strong style={{ color: "#595959", display: "inline-block", width: "120px" }}>Người gửi:</strong> {selectedApp?.userId?.displayName || selectedApp?.userId?.userName || selectedApp?.displayName || selectedApp?.userName || "Không rõ"}</div>
            <div style={{ marginBottom: "12px", fontSize: "14px" }}><strong style={{ color: "#595959", display: "inline-block", width: "120px" }}>Email:</strong> {selectedApp?.userId?.email || selectedApp?.email || "Không rõ"}</div>
            <div style={{ marginBottom: "16px", fontSize: "14px" }}><strong style={{ color: "#595959", display: "inline-block", width: "120px" }}>SĐT Xác nhận:</strong> {selectedApp?.submittedPhoneNumber || selectedApp?.userId?.phoneNumber || selectedApp?.phoneNumber || "Không rõ"}</div>
            <div style={{ marginBottom: "24px" }}>
              <strong style={{ color: "#595959", fontSize: "14px" }}>Lý do tham gia:</strong>
              <div style={{ marginTop: "8px", padding: "14px", background: "#f5f5f5", borderRadius: "6px", fontSize: "14px", color: "#262626", border: "1px solid #e8e8e8", minHeight: "80px", whiteSpace: "pre-wrap" }}>
                {selectedApp.motivation || "Không có nội dung."}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
              {selectedApp.status === "PENDING" ? (
                <>
                  <button onClick={() => setShowRejectModal(true)} style={{ padding: "8px 20px", background: "#fff1f0", color: "#cf1322", border: "1px solid #ffa39e", borderRadius: "6px", cursor: "pointer", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#ffccc7"} onMouseLeave={(e) => e.currentTarget.style.background = "#fff1f0"}>Từ chối</button>
                  <button onClick={() => handleApprove(selectedApp._id)} style={{ padding: "8px 20px", background: "#52c41a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, transition: "background 0.2s", boxShadow: "0 2px 0 rgba(0,0,0,0.045)" }} onMouseEnter={(e) => e.currentTarget.style.background = "#389e0d"} onMouseLeave={(e) => e.currentTarget.style.background = "#52c41a"}>Chấp nhận</button>
                </>
              ) : (
                <div style={{ color: "#8c8c8c", fontStyle: "italic", fontSize: "14px" }}>Đơn này đã được xử lý ({selectedApp.status}).</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập lý do từ chối */}
      {showRejectModal && selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "400px", maxWidth: "90%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#cf1322" }}>Từ chối đơn đăng ký</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8c8c8c" }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px", color: "#262626" }}>Vui lòng nhập lý do từ chối:</label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d9d9d9", minHeight: "100px", resize: "none", fontSize: "14px", outline: "none" }}
                placeholder="Ví dụ: Chưa đủ điều kiện yêu cầu..."
                onFocus={(e) => e.target.style.borderColor = "#1890ff"}
                onBlur={(e) => e.target.style.borderColor = "#d9d9d9"}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: "8px 16px", background: "#f5f5f5", border: "1px solid #d9d9d9", color: "#595959", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}>Hủy</button>
              <button onClick={submitReject} disabled={!rejectReason.trim()} style={{ padding: "8px 16px", background: "#cf1322", color: "#fff", border: "none", borderRadius: "6px", cursor: !rejectReason.trim() ? "not-allowed" : "pointer", fontWeight: 600, opacity: !rejectReason.trim() ? 0.5 : 1 }}>Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      </>
      )}

    </div>
  );
}