"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBoxOpen, FaCheckCircle, FaSync, FaWarehouse } from "react-icons/fa";
import { toast } from "sonner";
import GoongTeamMissionMap from "@/modules/map/presentation/components/GoongTeamMissionMap";
import SupplyClaimCard from "./SupplyClaimCard";
import ClaimConfirmModal from "./ClaimConfirmModal";
import PendingApprovalView from "./PendingApprovalView";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import { missionSupplyApi } from "@/modules/supplies/infrastructure/missionSupply.api";
import { timelineSupplyApi } from "@/modules/supplies/infrastructure/timelineSupply.api";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { MissionSupply } from "@/modules/supplies/domain/missionSupply.entity";
import type { TimelineSupply } from "@/modules/supplies/domain/timelineSupply.entity";

interface ClaimStepViewProps {
  timeline: Timeline;
  mission: Mission;
  missionRequests: MissionRequest[];
  onConfirmClaim: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface ClaimModalData {
  missionSupplyId: string;
  allocatedQty: number;
  supplyName: string;
  warehouseName: string;
  unit: string;
}

export default function ClaimStepView({
  timeline,
  mission,
  missionRequests,
  onConfirmClaim,
  loading = false,
  disabled = false,
}: ClaimStepViewProps) {
  // If timeline is PENDING_APPROVAL, show approval tracking view
  if (timeline.status === "PENDING_APPROVAL") {
    return <PendingApprovalView timelineId={timeline._id} />;
  }

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [missionSupplies, setMissionSupplies] = useState<MissionSupply[]>([]);
  const [timelineSupplies, setTimelineSupplies] = useState<TimelineSupply[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [claimingSupplyId, setClaimingSupplyId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ClaimModalData | null>(null);

  const missionId = typeof mission._id === 'string' ? mission._id : (mission._id as any);

  const fetchSupplies = useCallback(async () => {
    try {
      const [msResponse, tsResponse] = await Promise.all([
        missionSupplyApi.getMissionSupplies(missionId),
        timelineSupplyApi.getTimelineSupplies(timeline._id),
      ]);

      const msData = (msResponse as any).data || [];
      const tsData = (tsResponse as any).data || [];

      setMissionSupplies(msData);
      setTimelineSupplies(tsData);
    } catch (err) {
      console.error("Error fetching supplies:", err);
      toast.error("Không thể tải danh sách vật tư");
    }
  }, [missionId, timeline._id]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      try {
        const data = await warehouseRepository.getWarehouses();
        const list = data.warehouses || [];
        setWarehouses(list);
        if (list.length > 0) {
          setSelectedWarehouseId((prev) => prev || list[0]._id);
        }
      } catch (err) {
        console.error("Error fetching warehouses:", err);
        toast.error("Không thể tải danh sách kho vật tư");
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
    fetchSupplies();
  }, [fetchSupplies]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSupplies();
      toast.success("Đã làm mới danh sách vật tư");
    } catch (err) {
      console.error("Error refreshing supplies:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchSupplies]);

  const handleClaimClick = (missionSupplyId: string, allocatedQty: number, supplyName: string, warehouseName: string) => {
    const missionSupply = missionSupplies.find(ms => ms._id === missionSupplyId);
    const unit =
      missionSupply?.supplyId && typeof missionSupply.supplyId === "object"
        ? missionSupply.supplyId.unit || ""
        : "";
    
    setModalData({
      missionSupplyId,
      allocatedQty,
      supplyName,
      warehouseName,
      unit,
    });
  };

  const handleConfirmClaimSupply = async () => {
    if (!modalData) return;

    // Find the corresponding TimelineSupply
    const timelineSupply = timelineSupplies.find(
      ts => ts.missionSupplyId === modalData.missionSupplyId && ts.status === "APPROVED"
    );

    if (!timelineSupply) {
      toast.error("Không tìm thấy vật tư đã được duyệt");
      return;
    }

    setClaimingSupplyId(modalData.missionSupplyId);
    try {
      await timelineSupplyApi.claimSupply(timelineSupply._id);

      toast.success(`✅ Đã nhận ${modalData.allocatedQty} ${modalData.unit} ${modalData.supplyName}`);
      setModalData(null);
      await fetchSupplies();
    } catch (err: any) {
      console.error("Error claiming supply:", err);
      toast.error(err?.response?.data?.message || "Không thể nhận vật tư");
    } finally {
      setClaimingSupplyId(null);
    }
  };

  const filteredMissionSupplies = selectedWarehouseId
    ? missionSupplies.filter((ms) => {
        const warehouseId =
          ms.warehouseId && typeof ms.warehouseId === "object"
            ? ms.warehouseId._id
            : "";
        return warehouseId === selectedWarehouseId;
      })
    : missionSupplies;

  const allocatedSupplies = filteredMissionSupplies.filter(
    (ms) => ms.status === "ALLOCATED" || ms.status === "FULLY_CLAIMED",
  );
  const requestedSupplies = filteredMissionSupplies.filter((ms) => ms.status === "REQUESTED");
  const selectedWarehouseName = warehouses.find((wh) => wh._id === selectedWarehouseId)?.name || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Map Section - 65% */}
      <div className="lg:col-span-2 h-full overflow-hidden">
        <GoongTeamMissionMap
          step="assigned"
          missionRequests={missionRequests}
          warehouses={warehouses}
          selectedRequestId={null}
          onRequestClick={() => {}}
          className="h-full"
        />
      </div>

      {/* Supply Panel - 35% - Scrollable */}
      <div className="lg:col-span-1 h-full overflow-y-auto scrollbar-hide pr-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-mission-text-primary">
            <FaBoxOpen className="text-mission-icon-supplies text-lg" />
            <h3 className="text-sm font-bold uppercase tracking-wide">VẬT TƯ CẦN NHẬN</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-mission-text-primary transition-colors disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <FaSync className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Warehouse Selection */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
          <label className="block text-xs uppercase tracking-wide text-mission-text-muted font-semibold mb-2">
            Chọn kho vật tư
          </label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            disabled={loadingWarehouses || warehouses.length === 0}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-mission-text-primary text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 [&>option]:bg-white [&>option]:text-slate-900"
          >
            {warehouses.length === 0 ? (
              <option value="">Không có kho khả dụng</option>
            ) : (
              warehouses.map((wh) => (
                <option key={wh._id} value={wh._id}>
                  {wh.name}
                </option>
              ))
            )}
          </select>
          {selectedWarehouseName && (
            <p className="mt-2 text-xs text-mission-text-subtle">
              Đang hiển thị vật tư từ kho: <span className="text-mission-text-primary font-medium">{selectedWarehouseName}</span>
            </p>
          )}
        </div>

        {/* Supplies List */}
        <div className="space-y-3">
          {/* Allocated section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-mission-text-muted font-semibold">
                Đã phân bổ ({allocatedSupplies.length})
              </p>
            </div>

            {allocatedSupplies.length === 0 ? (
              <div className="text-center py-6 text-gray-400 border border-dashed border-white/10 rounded-xl">
                <p className="text-2xl mb-1">📦</p>
                <p className="text-sm">Chưa có vật tư đã phân bổ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allocatedSupplies.map((missionSupply) => {
                  const timelineSupply = timelineSupplies.find(
                    ts => ts.missionSupplyId === missionSupply._id
                  );
                  
                  return (
                    <SupplyClaimCard
                      key={missionSupply._id}
                      missionSupply={missionSupply}
                      timelineSupply={timelineSupply}
                      onClaim={handleClaimClick}
                      loading={claimingSupplyId === missionSupply._id}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Requested section */}
          <div className="space-y-2 pt-2">
            <p className="text-xs uppercase tracking-wide text-mission-text-muted font-semibold">
              Chờ phân bổ ({requestedSupplies.length})
            </p>

            {requestedSupplies.length === 0 ? (
              <div className="text-center py-5 text-gray-500 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs">Không có vật tư chờ phân bổ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requestedSupplies.map((missionSupply) => {
                  const supplyName =
                    missionSupply.supplyId && typeof missionSupply.supplyId === "object"
                      ? missionSupply.supplyId.name || "Unknown Supply"
                      : "Unknown Supply";
                  const unit =
                    missionSupply.supplyId && typeof missionSupply.supplyId === "object"
                      ? missionSupply.supplyId.unit || ""
                      : "";

                  return (
                    <div
                      key={missionSupply._id}
                      className="bg-mission-bg-secondary border border-mission-border/60 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-mission-text-primary truncate">{supplyName}</p>
                          <p className="text-xs text-mission-text-subtle mt-1">
                            Nhu cầu: <span className="font-mono">{missionSupply.plannedQty}</span> {unit}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                          <FaWarehouse className="text-[10px]" />
                          Chờ Manager phân bổ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {allocatedSupplies.length === 0 && requestedSupplies.length === 0 ? (
            <div className="text-center py-6 text-gray-500 border border-dashed border-white/10 rounded-xl">
              <p className="text-xs">Chưa có dữ liệu vật tư cho mission này</p>
            </div>
          ) : null}
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onConfirmClaim}
            disabled={loading || disabled}
            className="w-full px-6 py-4 rounded-xl bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FaCheckCircle className="text-lg" />
                Xác nhận đã lấy đủ vật tư
              </>
            )}
          </button>
          <p className="text-xs text-mission-text-subtle text-center mt-2">
            Bạn có thể tiếp tục ngay cả khi chưa nhận hết vật tư
          </p>
        </div>
      </div>

      {/* Claim Confirm Modal */}
      {modalData && (
        <ClaimConfirmModal
          isOpen={!!modalData}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirmClaimSupply}
          supply={{
            name: modalData.supplyName,
            quantity: modalData.allocatedQty,
            unit: modalData.unit,
            warehouseName: modalData.warehouseName,
          }}
          loading={!!claimingSupplyId}
        />
      )}
    </div>
  );
}
