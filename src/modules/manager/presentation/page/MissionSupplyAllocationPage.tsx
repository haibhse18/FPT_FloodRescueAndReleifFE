"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { missionSupplyApi } from "@/modules/supplies/infrastructure/missionSupply.api";
import type { MissionSupply } from "@/modules/supplies/domain/missionSupply.entity";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

interface AllocationDraft {
  warehouseId: string;
  allocatedQty: string;
}

const DEFAULT_LIMIT = 100;

const getMissionId = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return row.missionId;
  return row.missionId?._id || "";
};

const getMissionLabel = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return row.missionId;
  const missionName = row.missionId?.name || "Mission";
  const missionCode = row.missionId?.code ? ` (${row.missionId.code})` : "";
  return `${missionName}${missionCode}`;
};

const getSupplyId = (row: MissionSupply): string => {
  if (typeof row.supplyId === "string") return row.supplyId;
  return row.supplyId?._id || "";
};

const getSupplyName = (row: MissionSupply): string => {
  if (typeof row.supplyId === "string") return "Unknown supply";
  return row.supplyId?.name || "Unknown supply";
};

const getSupplyUnit = (row: MissionSupply): string => {
  if (typeof row.supplyId === "string") return "";
  return row.supplyId?.unit || "";
};

const getComboLabel = (row: MissionSupply): string | null => {
  if (!row.comboSupplyId) return null;
  if (typeof row.comboSupplyId === "string") return row.comboSupplyId;
  const name = row.comboSupplyId.name || "Combo";
  const type = row.comboSupplyId.incidentType ? ` (${row.comboSupplyId.incidentType})` : "";
  return `${name}${type}`;
};

/**
 * Backend có thể trả về số lượng nhu cầu với nhiều tên field khác nhau.
 * Thử lần lượt: plannedQty → requestedQty → quantity → qty
 */
const getNeededQty = (row: MissionSupply): number => {
  const raw = row as any;
  return (
    Number(raw.plannedQty) ||
    Number(raw.requestedQty) ||
    Number(raw.quantity) ||
    Number(raw.qty) ||
    0
  );
};

export default function MissionSupplyAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [allocatingId, setAllocatingId] = useState<string | null>(null);
  const [missionSupplies, setMissionSupplies] = useState<MissionSupply[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, AllocationDraft>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [missionSupplyRes, warehouseRes] = await Promise.all([
        missionSupplyApi.getMissionSuppliesByQuery({
          status: "REQUESTED",
          page: 1,
          limit: DEFAULT_LIMIT,
        }),
        warehouseRepository.getWarehouses(),
      ]);

      const supplies = missionSupplyRes.data || [];
      // Debug: log raw fields để kiểm tra tên field số lượng từ backend
      if (supplies.length > 0) {
        const sample = supplies[0] as any;
        console.log("[MissionSupply] sample row fields:", {
          plannedQty: sample.plannedQty,
          requestedQty: sample.requestedQty,
          quantity: sample.quantity,
          qty: sample.qty,
          _raw: sample,
        });
      }
      setMissionSupplies(supplies);
      setWarehouses(warehouseRes.warehouses || []);
    } catch (error) {
      console.error("Failed to load manager allocation data:", error);
      toast.error("Không thể tải danh sách vật tư chờ phân bổ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return missionSupplies;

    return missionSupplies.filter((row) => {
      const missionLabel = getMissionLabel(row).toLowerCase();
      const supplyName = getSupplyName(row).toLowerCase();
      const comboLabel = (getComboLabel(row) || "").toLowerCase();
      return (
        missionLabel.includes(normalized) ||
        supplyName.includes(normalized) ||
        comboLabel.includes(normalized)
      );
    });
  }, [missionSupplies, query]);

  const groupedMissions = useMemo(() => {
    const groups: Record<string, MissionSupply[]> = {};
    filteredRows.forEach((row) => {
      const missionId = getMissionId(row) || "unknown";
      if (!groups[missionId]) groups[missionId] = [];
      groups[missionId].push(row);
    });
    return Object.values(groups);
  }, [filteredRows]);

  const updateDraft = (missionSupplyId: string, patch: Partial<AllocationDraft>) => {
    setDrafts((prev) => {
      const current = prev[missionSupplyId] || { warehouseId: "", allocatedQty: "" };
      return {
        ...prev,
        [missionSupplyId]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const handleAllocate = async (row: MissionSupply) => {
    const missionSupplyId = row._id;
    const draft = drafts[missionSupplyId];
    const allocatedQty = Number(draft?.allocatedQty || 0);

    if (!draft?.warehouseId) {
      toast.error("Vui lòng chọn kho trước khi phân bổ");
      return;
    }
    if (!Number.isFinite(allocatedQty) || allocatedQty <= 0) {
      toast.error("Số lượng phân bổ phải lớn hơn 0");
      return;
    }
    if (allocatedQty > getNeededQty(row)) {
      toast.error("Số lượng phân bổ không được vượt quá nhu cầu");
      return;
    }

    setAllocatingId(missionSupplyId);
    try {
      // Gọi đúng endpoint: PATCH /mission-supplies/:id/allocate
      await missionSupplyApi.allocateMissionSupply(missionSupplyId, {
        warehouseId: draft.warehouseId,
        allocatedQty,
        status: "ALLOCATED",
      });

      toast.success(`Đã phân bổ ${allocatedQty} ${getSupplyUnit(row)} ${getSupplyName(row)}`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[missionSupplyId];
        return next;
      });
      await fetchData();
    } catch (error: any) {
      console.error("Allocate failed:", error);
      toast.error(error?.response?.data?.message || "Phân bổ thất bại");
    } finally {
      setAllocatingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Phân bổ vật tư theo mission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách vật tư ở trạng thái <span className="font-semibold text-amber-600">REQUESTED</span> (từ combo supply đội đã chọn) chờ Manager phân bổ kho.
        </p>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên mission, vật tư hoặc combo..."
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          onClick={fetchData}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center text-gray-500">Không có vật tư chờ phân bổ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">Mission</th>
                  <th className="px-4 py-3 font-semibold">Combo Supply</th>
                  <th className="px-4 py-3 font-semibold">Vật tư</th>
                  <th className="px-4 py-3 font-semibold">Nhu cầu</th>
                  <th className="px-4 py-3 font-semibold">Kho phân bổ</th>
                  <th className="px-4 py-3 font-semibold">Số lượng cấp</th>
                  <th className="px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedMissions.map((missionGroup) => {
                  const firstRow = missionGroup[0];
                  const comboLabel = getComboLabel(firstRow);

                  return (
                    <React.Fragment key={getMissionId(firstRow) || Math.random()}>
                      {missionGroup.map((row, index) => {
                        const draft = drafts[row._id] || { warehouseId: "", allocatedQty: "" };
                        const planned = getNeededQty(row);
                        const supplyUnit = getSupplyUnit(row);

                        return (
                          <tr key={row._id} className={`${index === 0 ? 'border-t border-gray-200' : ''} hover:bg-gray-50/50 transition-colors`}>
                            {/* Mission — span toàn bộ supplies trong group */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 text-sm font-medium text-gray-900 align-top border-r border-gray-100 bg-gray-50/30 w-[180px]"
                              >
                                {getMissionLabel(row)}
                              </td>
                            )}

                            {/* Combo Supply — chỉ hiển thị ở hàng đầu của group */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 align-top border-r border-gray-100 w-[180px]"
                              >
                                {comboLabel ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    📦 {comboLabel}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">—</span>
                                )}
                              </td>
                            )}

                            <td className="px-4 py-4 text-sm text-gray-800 align-middle">
                              <span className="font-medium">{getSupplyName(row)}</span>
                              <div className="text-xs text-gray-400 mt-0.5 font-mono">
                                {getSupplyId(row).slice(-8)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-mono text-gray-800 align-middle">
                              {planned} {supplyUnit}
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <select
                                value={draft.warehouseId}
                                onChange={(e) => updateDraft(row._id, { warehouseId: e.target.value })}
                                className="w-full min-w-[200px] px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                              >
                                <option value="">Chọn kho...</option>
                                {warehouses.map((warehouse) => (
                                  <option key={warehouse._id} value={warehouse._id}>
                                    {warehouse.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <input
                                type="number"
                                min={1}
                                max={planned || undefined}
                                value={draft.allocatedQty}
                                onChange={(e) => updateDraft(row._id, { allocatedQty: e.target.value })}
                                className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                              />
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <button
                                onClick={() => handleAllocate(row)}
                                disabled={allocatingId === row._id}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                              >
                                {allocatingId === row._id ? "Đang phân bổ..." : "Phân bổ"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
