"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBoxOpen, FaCheckCircle, FaSync, FaWarehouse } from "react-icons/fa";
import { toast } from "sonner";
import GoongTeamMissionMap from "@/modules/map/presentation/components/GoongTeamMissionMap";
import SupplyClaimCard from "./SupplyClaimCard";
import ClaimConfirmModal from "./ClaimConfirmModal";
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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [missionSupplies, setMissionSupplies] = useState<MissionSupply[]>([]);
  const [timelineSupplies, setTimelineSupplies] = useState<TimelineSupply[]>([]);
  const [refreshing, setRefreshing] = useState(false);
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
      try {
        const data = await warehouseRepository.getWarehouses();
        setWarehouses(data.warehouses || []);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
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

    setClaimingSupplyId(modalData.missionSupplyId);
    try {
      await timelineSupplyApi.claimSupply({
        timelineId: timeline._id,
        missionSupplyId: modalData.missionSupplyId,
        carriedQty: modalData.allocatedQty,
      });

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

  const allocatedSupplies = missionSupplies.filter(ms => 
    ms.status === "ALLOCATED" || ms.status === "FULLY_CLAIMED"
  );
  const requestedSupplies = missionSupplies.filter(ms => ms.status === "REQUESTED");

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
