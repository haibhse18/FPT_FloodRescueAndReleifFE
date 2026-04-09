"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { missionSupplyApi } from "@/modules/supplies/infrastructure/missionSupply.api";
import type { MissionSupply } from "@/modules/supplies/domain/missionSupply.entity";
import { comboSupplyApi } from "@/modules/supplies/infrastructure/comboSupply.api";
import type { ComboSupply } from "@/modules/supplies/domain/comboSupply.entity";

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

const getComboLabel = (
  row: MissionSupply,
  comboMap?: Record<string, ComboSupply>
): string | null => {
  if (!row.comboSupplyId) return null;

  if (typeof row.comboSupplyId === "string") {
    // Thử resolve từ comboMap
    const resolved = comboMap?.[row.comboSupplyId];
    if (resolved) {
      const type = resolved.incidentType ? ` (${resolved.incidentType})` : "";
      return `${resolved.name}${type}`;
    }
    // Fallback: hiển thị ID rút gọn
    return `Combo #${row.comboSupplyId.slice(-6)}`;
  }

  // Backend đã populate object
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

export default function MissionSupplyAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [allocatingGroupId, setAllocatingGroupId] = useState<string | null>(null);
  const [missionSupplies, setMissionSupplies] = useState<MissionSupply[]>([]);
  const [comboMap, setComboMap] = useState<Record<string, ComboSupply>>({});
  const [query, setQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [missionSupplyRes, comboRes] = await Promise.all([
        missionSupplyApi.getMissionSuppliesByQuery({
          status: "REQUESTED",
          page: 1,
          limit: DEFAULT_LIMIT,
        }),
        comboSupplyApi.getComboSupplies(),
      ]);

      const map: Record<string, ComboSupply> = {};
      (comboRes.data || []).forEach((c) => { map[c._id] = c; });
      setComboMap(map);

      setMissionSupplies(missionSupplyRes.data || []);
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
      const comboLabel = (getComboLabel(row, comboMap) || "").toLowerCase();
      return (
        missionLabel.includes(normalized) ||
        supplyName.includes(normalized) ||
        comboLabel.includes(normalized)
      );
    });
  }, [missionSupplies, query, comboMap]);

  const groupedMissions = useMemo(() => {
    const groups: Record<string, MissionSupply[]> = {};
    filteredRows.forEach((row) => {
      const missionId = getMissionId(row) || "unknown";
      if (!groups[missionId]) groups[missionId] = [];
      groups[missionId].push(row);
    });
    return Object.values(groups);
  }, [filteredRows]);

  const handleAllocateAll = async (missionGroup: MissionSupply[]) => {
    const missionId = getMissionId(missionGroup[0]);

    // Kiểm tra tất cả supply đã có warehouse chưa
    const missingWarehouse = missionGroup.find((row) => !getWarehouseId(row));
    if (missingWarehouse) {
      toast.error(
        `Vật tư "${getSupplyName(missingWarehouse)}" chưa được đội chỉ định kho. Vui lòng kiểm tra lại.`
      );
      return;
    }

    setAllocatingGroupId(missionId);
    try {
      await Promise.all(
        missionGroup.map((row) =>
          missionSupplyApi.allocateMissionSupply(row._id, {
            warehouseId: getWarehouseId(row),
            allocatedQty: getNeededQty(row),
            status: "ALLOCATED",
          })
        )
      );

      toast.success(`Đã phân bổ tất cả vật tư cho mission ${getMissionLabel(missionGroup[0])}`);
      await fetchData();
    } catch (error: any) {
      console.error("Allocate all failed:", error);
      toast.error(error?.response?.data?.message || "Phân bổ thất bại");
    } finally {
      setAllocatingGroupId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Phân bổ vật tư theo mission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách vật tư ở trạng thái{" "}
          <span className="font-semibold text-amber-600">REQUESTED</span> (từ combo supply đội đã
          chọn) chờ Manager phân bổ kho.
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
            <table className="w-full min-w-[900px]">
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
                  const comboLabel = getComboLabel(firstRow, comboMap);
                  const missionId = getMissionId(firstRow);
                  const isAllocating = allocatingGroupId === missionId;
                  // Kho chung cho cả group — lấy từ firstRow
                  const groupWarehouseName = getWarehouseName(firstRow);

                  return (
                    <React.Fragment key={missionId || Math.random()}>
                      {missionGroup.map((row, index) => {
                        const planned = getNeededQty(row);
                        const supplyUnit = getSupplyUnit(row);

                        return (
                          <tr
                            key={row._id}
                            className={`${
                              index === 0 ? "border-t border-gray-200" : ""
                            } hover:bg-gray-50/50 transition-colors`}
                          >
                            {/* Mission — rowspan toàn bộ supplies trong group */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 text-sm font-medium text-gray-900 align-top border-r border-gray-100 bg-gray-50/30 w-[180px]"
                              >
                                {getMissionLabel(row)}
                              </td>
                            )}

                            {/* Combo Supply — rowspan, hiển thị ở hàng đầu của group */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 align-top border-r border-gray-100 w-[190px]"
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

                            {/* Tên vật tư */}
                            <td className="px-4 py-4 text-sm text-gray-800 align-middle">
                              <span className="font-medium">{getSupplyName(row)}</span>
                              <div className="text-xs text-gray-400 mt-0.5 font-mono">
                                {getSupplyId(row).slice(-8)}
                              </div>
                            </td>

                            {/* Nhu cầu */}
                            <td className="px-4 py-4 text-sm font-mono text-gray-800 align-middle">
                              {planned} {supplyUnit}
                            </td>

                            {/* Kho chung cho group — rowspan, chỉ hiện ở hàng đầu */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 align-middle"
                              >
                                {groupWarehouseName ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                                    🏭 {groupWarehouseName}
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-400 italic">
                                    Chưa chỉ định kho
                                  </span>
                                )}
                              </td>
                            )}

                            {/* Số lượng cấp = nhu cầu (read-only) */}
                            <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-800 align-middle">
                              {planned} {supplyUnit}
                            </td>

                            {/* Nút "Phân bổ tất cả" — rowspan, chỉ hiện ở hàng đầu của group */}
                            {index === 0 && (
                              <td
                                rowSpan={missionGroup.length}
                                className="px-4 py-4 align-middle"
                              >
                                <button
                                  onClick={() => handleAllocateAll(missionGroup)}
                                  disabled={isAllocating}
                                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm whitespace-nowrap"
                                >
                                  {isAllocating ? "Đang phân bổ..." : "Phân bổ tất cả"}
                                </button>
                              </td>
                            )}
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
