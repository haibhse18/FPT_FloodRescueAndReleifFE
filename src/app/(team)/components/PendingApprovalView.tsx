"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBoxOpen, FaTruck, FaSync, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { timelineSupplyApi } from "@/modules/supplies/infrastructure/timelineSupply.api";
import { timelineVehicleApi } from "@/modules/supplies/infrastructure/timelineVehicle.api";
import type { TimelineSupply } from "@/modules/supplies/domain/timelineSupply.entity";
import type { TimelineVehicle } from "@/modules/supplies/domain/timelineVehicle.entity";

interface PendingApprovalViewProps {
  timelineId: string;
}

export default function PendingApprovalView({ timelineId }: PendingApprovalViewProps) {
  const [supplies, setSupplies] = useState<TimelineSupply[]>([]);
  const [vehicles, setVehicles] = useState<TimelineVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [suppliesRes, vehiclesRes] = await Promise.all([
        timelineSupplyApi.getTimelineSupplies(timelineId),
        timelineVehicleApi.getTimelineVehicles(timelineId),
      ]);

      setSupplies((suppliesRes as any).data || []);
      setVehicles((vehiclesRes as any).data || []);
    } catch (error: any) {
      console.error("Error fetching approval data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [timelineId]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Đã làm mới");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESERVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
            <FaClock className="text-xs" />
            Chờ duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
            <FaCheckCircle className="text-xs" />
            Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
            <FaTimes className="text-xs" />
            Từ chối
          </span>
        );
      default:
        return <span className="text-white/50 text-xs">{status}</span>;
    }
  };

  const getSupplyName = (supply: TimelineSupply) => {
    if (typeof supply.supplyId === "object") {
      return supply.supplyId.name;
    }
    return "Unknown";
  };

  const getSupplyUnit = (supply: TimelineSupply) => {
    if (typeof supply.supplyId === "object") {
      return supply.supplyId.unit;
    }
    return "";
  };

  const getVehicleName = (vehicle: TimelineVehicle) => {
    if (typeof vehicle.vehicleId === "object") {
      return vehicle.vehicleId.name;
    }
    return "Unknown";
  };

  const getVehicleType = (vehicle: TimelineVehicle) => {
    if (typeof vehicle.vehicleId === "object") {
      return vehicle.vehicleId.type;
    }
    return "";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-white animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  const allApproved = [...supplies, ...vehicles].every(item => item.status === "APPROVED" || item.status === "REJECTED");
  const hasApproved = [...supplies, ...vehicles].some(item => item.status === "APPROVED");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Chờ Manager duyệt</h3>
          <p className="text-sm text-white/60 mt-1">
            {allApproved && hasApproved
              ? "✅ Đã được duyệt! Có thể bắt đầu nhận vật tư"
              : "⏳ Đang chờ Manager xét duyệt vật tư và phương tiện"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-4">
        {/* Supplies */}
        {supplies.length > 0 && (
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaBoxOpen className="text-mission-icon-supplies" />
              <h4 className="text-sm font-bold text-mission-text-primary uppercase">Vật tư</h4>
            </div>
            <div className="space-y-2">
              {supplies.map(supply => (
                <div
                  key={supply._id}
                  className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{getSupplyName(supply)}</p>
                    <p className="text-white/60 text-xs mt-1">
                      Yêu cầu: {supply.requestedQty} {getSupplyUnit(supply)}
                      {supply.approvedQty !== undefined && supply.approvedQty !== supply.requestedQty && (
                        <span className="ml-2 text-yellow-400">
                          • Duyệt: {supply.approvedQty} {getSupplyUnit(supply)}
                        </span>
                      )}
                    </p>
                    {supply.note && (
                      <p className="text-white/50 text-xs mt-1 italic">Ghi chú: {supply.note}</p>
                    )}
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(supply.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaTruck className="text-mission-icon-supplies" />
              <h4 className="text-sm font-bold text-mission-text-primary uppercase">Phương tiện</h4>
            </div>
            <div className="space-y-2">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle._id}
                  className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{getVehicleName(vehicle)}</p>
                    <p className="text-white/60 text-xs mt-1">{getVehicleType(vehicle)}</p>
                    {vehicle.note && (
                      <p className="text-white/50 text-xs mt-1 italic">Ghi chú: {vehicle.note}</p>
                    )}
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {supplies.length === 0 && vehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">Không có vật tư hoặc phương tiện nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
