"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { missionSupplyApi } from "@/modules/supplies/infrastructure/missionSupply.api";
import type { MissionSupply } from "@/modules/supplies/domain/missionSupply.entity";
import { comboSupplyApi } from "@/modules/supplies/infrastructure/comboSupply.api";
import type { ComboSupply } from "@/modules/supplies/domain/comboSupply.entity";
import { vehicleApi } from "@/modules/vehicles/infrastructure/vehicles.api";
import type { Vehicle } from "@/modules/vehicles/domain/vehicles.enity";

const DEFAULT_LIMIT = 100;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getMissionId = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return row.missionId;
  return row.missionId?._id || "";
};

const getMissionLabel = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return row.missionId;
  const name = row.missionId?.name || "Mission";
  const code = row.missionId?.code ? ` · ${row.missionId.code}` : "";
  return `${name}${code}`;
};

const getMissionCode = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return "";
  return row.missionId?.code || "";
};

const getMissionType = (row: MissionSupply): string => {
  if (typeof row.missionId === "string") return "";
  return (row.missionId as any)?.type || "";
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

const getComboLabel = (
  row: MissionSupply,
  comboMap?: Record<string, ComboSupply>
): string | null => {
  if (!row.comboSupplyId) return null;
  if (typeof row.comboSupplyId === "string") {
    const resolved = comboMap?.[row.comboSupplyId];
    if (resolved) {
      const type = resolved.incidentType ? ` (${resolved.incidentType})` : "";
      return `${resolved.name}${type}`;
    }
    return `Combo #${row.comboSupplyId.slice(-6)}`;
  }
  const name = row.comboSupplyId.name || "Combo";
  const type = row.comboSupplyId.incidentType ? ` (${row.comboSupplyId.incidentType})` : "";
  return `${name}${type}`;
};

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

const getWarehouseName = (row: MissionSupply): string => {
  if (!row.warehouseId) return "";
  if (typeof row.warehouseId === "string") return row.warehouseId;
  return (row.warehouseId as any).name || "";
};

const getWarehouseId = (row: MissionSupply): string => {
  if (!row.warehouseId) return "";
  if (typeof row.warehouseId === "string") return row.warehouseId;
  return (row.warehouseId as any)._id || "";
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  AMBULANCE: "Ambulance",
  RESCUE_BOAT: "Xuồng cứu hộ",
  FIRE_TRUCK: "Xe cứu hỏa",
  TRUCK: "Xe tải",
  VAN: "Van",
  MOTORCYCLE: "Mô tô",
  OTHERS: "Khác",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RESCUE: { label: "Cứu hộ", color: "bg-red-50 text-red-700 border-red-100" },
  RELIEF: { label: "Cứu trợ", color: "bg-blue-50 text-blue-700 border-blue-100" },
  DEFAULT: { label: "Mission", color: "bg-gray-50 text-gray-700 border-gray-100" },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MissionSupplyAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [missionSupplies, setMissionSupplies] = useState<MissionSupply[]>([]);
  const [comboMap, setComboMap] = useState<Record<string, ComboSupply>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState("");

  // Per-group state
  const [allocatingGroupId, setAllocatingGroupId] = useState<string | null>(null);
  const [assigningVehicleGroupId, setAssigningVehicleGroupId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Record<string, string>>({});
  // Số lượng cấp có thể chỉnh sửa, mặc định = nhu cầu khi load
  const [allocatedQtyDraft, setAllocatedQtyDraft] = useState<Record<string, number>>({});

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [missionSupplyRes, comboRes, vehicleRes] = await Promise.all([
        missionSupplyApi.getMissionSuppliesByQuery({
          status: "REQUESTED",
          page: 1,
          limit: DEFAULT_LIMIT,
        }),
        comboSupplyApi.getComboSupplies(),
        vehicleApi.getVehicles(),
      ]);

      const map: Record<string, ComboSupply> = {};
      (comboRes.data || []).forEach((c) => { map[c._id] = c; });
      setComboMap(map);

      const supplies = missionSupplyRes.data || [];
      setMissionSupplies(supplies);
      setVehicles(vehicleRes?.data || []);
      // Khởi tạo số lượng cấp = nhu cầu cho mỗi supply
      const initQty: Record<string, number> = {};
      supplies.forEach((s) => { initQty[s._id] = getNeededQty(s); });
      setAllocatedQtyDraft((prev) => ({ ...prev, ...initQty }));
    } catch (error) {
      console.error("Failed to load allocation data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filtering & Grouping ───────────────────────────────────────────────

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return missionSupplies;
    return missionSupplies.filter((row) => {
      return (
        getMissionLabel(row).toLowerCase().includes(normalized) ||
        getSupplyName(row).toLowerCase().includes(normalized) ||
        (getComboLabel(row, comboMap) || "").toLowerCase().includes(normalized)
      );
    });
  }, [missionSupplies, query, comboMap]);

  const groupedMissions = useMemo(() => {
    const groups: Record<string, MissionSupply[]> = {};
    filteredRows.forEach((row) => {
      const id = getMissionId(row) || "unknown";
      if (!groups[id]) groups[id] = [];
      groups[id].push(row);
    });
    // Sắp xếp theo mới nhất trước (createdAt của row mới nhất trong group)
    return Object.values(groups).sort((a, b) => {
      const latestA = Math.max(...a.map((r) => new Date(r.createdAt).getTime()));
      const latestB = Math.max(...b.map((r) => new Date(r.createdAt).getTime()));
      return latestB - latestA;
    });
  }, [filteredRows]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleAllocateAll = async (missionGroup: MissionSupply[]) => {
    const missionId = getMissionId(missionGroup[0]);

    const missingWarehouse = missionGroup.find((row) => !getWarehouseId(row));
    if (missingWarehouse) {
      toast.error(`Vật tư "${getSupplyName(missingWarehouse)}" chưa được đội chỉ định kho.`);
      return;
    }

    // Validate số lượng
    const invalidQty = missionGroup.find((row) => {
      const qty = allocatedQtyDraft[row._id] ?? getNeededQty(row);
      return !Number.isFinite(qty) || qty <= 0;
    });
    if (invalidQty) {
      toast.error(`Số lượng cấp cho "${getSupplyName(invalidQty)}" phải lớn hơn 0`);
      return;
    }

    setAllocatingGroupId(missionId);
    try {
      await Promise.all(
        missionGroup.map((row) =>
          missionSupplyApi.allocateMissionSupply(row._id, {
            warehouseId: getWarehouseId(row),
            allocatedQty: allocatedQtyDraft[row._id] ?? getNeededQty(row),
            status: "ALLOCATED",
          })
        )
      );
      toast.success(`Đã phân bổ tất cả vật tư cho ${getMissionLabel(missionGroup[0])}`);
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Phân bổ thất bại");
    } finally {
      setAllocatingGroupId(null);
    }
  };

  const handleAssignVehicle = async (missionGroup: MissionSupply[]) => {
    const missionId = getMissionId(missionGroup[0]);
    const vehicleId = selectedVehicle[missionId];
    if (!vehicleId) {
      toast.error("Vui lòng chọn phương tiện trước khi gán");
      return;
    }

    setAssigningVehicleGroupId(missionId);
    try {
      await vehicleApi.assignVehicleToMission(vehicleId, missionId);
      toast.success(`Đã gán phương tiện cho ${getMissionLabel(missionGroup[0])}`);
      setSelectedVehicle((prev) => ({ ...prev, [missionId]: "" }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gán phương tiện thất bại");
    } finally {
      setAssigningVehicleGroupId(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân bổ vật tư & Phương tiện</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Các mission đang chờ Manager xác nhận phân bổ kho và gán phương tiện
            </p>
          </div>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên mission, vật tư hoặc combo..."
            className="pl-4 py-2.5 w-80 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {groupedMissions.length} mission đang chờ
          </span>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            ↻ Làm mới
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : groupedMissions.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-24 flex flex-col items-center gap-3">
          <p className="text-gray-500 font-medium">Không có mission nào đang chờ phân bổ</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {groupedMissions.map((missionGroup) => {
            const firstRow = missionGroup[0];
            const missionId = getMissionId(firstRow);
            const missionLabel = getMissionLabel(firstRow);
            const missionCode = getMissionCode(firstRow);
            const missionType = getMissionType(firstRow);
            const comboLabel = getComboLabel(firstRow, comboMap);
            const groupWarehouseName = getWarehouseName(firstRow);
            const isAllocating = allocatingGroupId === missionId;
            const isAssigning = assigningVehicleGroupId === missionId;
            const typeConfig = STATUS_CONFIG[missionType] || STATUS_CONFIG.DEFAULT;

            // Available vehicles: ACTIVE + not assigned to another current mission
            const availableVehicles = vehicles.filter(
              (v) => v.status === "ACTIVE" || v.status === "IN_USE"
            );

            return (
              <div
                key={missionId}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {missionLabel.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-gray-900 text-base">{missionLabel}</h2>
                        {missionCode && (
                          <span className="font-mono text-xs text-gray-400">#{missionCode}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {missionType && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.color}`}
                          >
                            {typeConfig.label}
                          </span>
                        )}
                        {comboLabel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            📦 {comboLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {missionGroup.length} vật tư
                    </span>
                    {groupWarehouseName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        🏭 {groupWarehouseName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Supply Table */}
                <div className="px-6 pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Danh sách vật tư
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-500 font-semibold">
                          <th className="px-4 py-2.5">Vật tư</th>
                          <th className="px-4 py-2.5">Nhu cầu</th>
                          <th className="px-4 py-2.5">Kho</th>
                          <th className="px-4 py-2.5">Số lượng cấp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {missionGroup.map((row) => {
                          const planned = getNeededQty(row);
                          const unit = getSupplyUnit(row);
                          const wh = getWarehouseName(row);
                          return (
                            <tr key={row._id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-800">{getSupplyName(row)}</span>
                                <span className="block text-xs text-gray-400 font-mono mt-0.5">
                                  …{getSupplyId(row).slice(-8)}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-700">
                                {planned} <span className="text-gray-400">{unit}</span>
                              </td>
                              <td className="px-4 py-3">
                                {wh ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    🏭 {wh}
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-400 italic">Chưa chỉ định</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={1}
                                    value={allocatedQtyDraft[row._id] ?? planned}
                                    onChange={(e) =>
                                      setAllocatedQtyDraft((prev) => ({
                                        ...prev,
                                        [row._id]: Number(e.target.value),
                                      }))
                                    }
                                    className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-mono font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                  <span className="text-xs text-gray-400">{unit}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 py-4 flex flex-wrap items-end gap-4">
                  {/* Supply Allocation */}
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Phân bổ vật tư
                    </p>
                    <button
                      onClick={() => handleAllocateAll(missionGroup)}
                      disabled={isAllocating}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm flex items-center gap-2"
                    >
                      {isAllocating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang phân bổ...
                        </>
                      ) : (
                        <>✅ Phân bổ tất cả vật tư</>
                      )}
                    </button>
                  </div>

                  {/* Vehicle Assignment */}
                  <div className="flex-1 min-w-[280px]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Gán phương tiện
                    </p>
                    <div className="flex gap-2 items-center">
                      <select
                        value={selectedVehicle[missionId] || ""}
                        onChange={(e) =>
                          setSelectedVehicle((prev) => ({
                            ...prev,
                            [missionId]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                      >
                        <option value="">Chọn phương tiện...</option>
                        {availableVehicles.map((v) => (
                          <option key={v.licensePlate} value={v.licensePlate}>
                            {VEHICLE_TYPE_LABELS[v.type] || v.type} — {v.licensePlate}{" "}
                            {v.brand ? `(${v.brand})` : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignVehicle(missionGroup)}
                        disabled={isAssigning || !selectedVehicle[missionId]}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                      >
                        {isAssigning ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang gán...
                          </>
                        ) : (
                          <>🚗 Gán xe</>
                        )}
                      </button>
                    </div>
                    {availableVehicles.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1.5">
                        ⚠️ Không có phương tiện khả dụng
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
