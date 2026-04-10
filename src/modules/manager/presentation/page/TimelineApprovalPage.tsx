"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { timelineApi } from "@/modules/timelines/infrastructure/timeline.api";
import { timelineSupplyApi } from "@/modules/supplies/infrastructure/timelineSupply.api";
import { timelineVehicleApi } from "@/modules/supplies/infrastructure/timelineVehicle.api";
import type { Timeline } from "@/modules/timelines/domain/timeline.entity";
import type { TimelineSupply } from "@/modules/supplies/domain/timelineSupply.entity";
import type { TimelineVehicle } from "@/modules/supplies/domain/timelineVehicle.entity";

export default function TimelineApprovalPage() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [timelineSupplies, setTimelineSupplies] = useState<Record<string, TimelineSupply[]>>({});
  const [timelineVehicles, setTimelineVehicles] = useState<Record<string, TimelineVehicle[]>>({});
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  const fetchTimelines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await timelineApi.getTimelines({ status: "PENDING_APPROVAL" });
      const data = (response as any).data || [];
      setTimelines(data);
    } catch (error) {
      console.error("Failed to load timelines:", error);
      toast.error("Không thể tải danh sách timeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  const fetchTimelineDetails = async (timelineId: string) => {
    try {
      const [suppliesRes, vehiclesRes] = await Promise.all([
        timelineSupplyApi.getTimelineSupplies(timelineId),
        timelineVehicleApi.getTimelineVehicles(timelineId),
      ]);

      setTimelineSupplies(prev => ({
        ...prev,
        [timelineId]: (suppliesRes as any).data || [],
      }));

      setTimelineVehicles(prev => ({
        ...prev,
        [timelineId]: (vehiclesRes as any).data || [],
      }));
    } catch (error) {
      console.error("Failed to load timeline details:", error);
      toast.error("Không thể tải chi tiết timeline");
    }
  };

  const handleToggleExpand = (timelineId: string) => {
    if (expandedTimelineId === timelineId) {
      setExpandedTimelineId(null);
    } else {
      setExpandedTimelineId(timelineId);
      if (!timelineSupplies[timelineId]) {
        fetchTimelineDetails(timelineId);
      }
    }
  };

  const handleApproveSupply = async (timelineSupplyId: string, approvedQty?: number) => {
    setProcessingItem(timelineSupplyId);
    try {
      await timelineSupplyApi.approveSupply(timelineSupplyId, approvedQty);
      toast.success("Đã duyệt vật tư");
      
      // Refresh timeline details
      if (expandedTimelineId) {
        await fetchTimelineDetails(expandedTimelineId);
      }
      await fetchTimelines();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể duyệt vật tư");
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRejectSupply = async (timelineSupplyId: string) => {
    const note = prompt("Lý do từ chối:");
    if (!note?.trim()) return;

    setProcessingItem(timelineSupplyId);
    try {
      await timelineSupplyApi.rejectSupply(timelineSupplyId, note);
      toast.success("Đã từ chối vật tư");
      
      if (expandedTimelineId) {
        await fetchTimelineDetails(expandedTimelineId);
      }
      await fetchTimelines();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể từ chối vật tư");
    } finally {
      setProcessingItem(null);
    }
  };

  const handleApproveVehicle = async (timelineVehicleId: string) => {
    setProcessingItem(timelineVehicleId);
    try {
      await timelineVehicleApi.approveVehicle(timelineVehicleId);
      toast.success("Đã duyệt phương tiện");
      
      if (expandedTimelineId) {
        await fetchTimelineDetails(expandedTimelineId);
      }
      await fetchTimelines();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể duyệt phương tiện");
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRejectVehicle = async (timelineVehicleId: string) => {
    const note = prompt("Lý do từ chối:");
    if (!note?.trim()) return;

    setProcessingItem(timelineVehicleId);
    try {
      await timelineVehicleApi.rejectVehicle(timelineVehicleId, note);
      toast.success("Đã từ chối phương tiện");
      
      if (expandedTimelineId) {
        await fetchTimelineDetails(expandedTimelineId);
      }
      await fetchTimelines();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể từ chối phương tiện");
    } finally {
      setProcessingItem(null);
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

  const getMissionName = (timeline: Timeline) => {
    if (typeof timeline.missionId === "object") {
      return (timeline.missionId as any).name || "Unknown";
    }
    return "Unknown";
  };

  const getTeamName = (timeline: Timeline) => {
    if (typeof timeline.teamId === "object") {
      return (timeline.teamId as any).name || "Unknown";
    }
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyệt vật tư & phương tiện</h1>
          <p className="text-sm text-gray-600 mt-1">
            {timelines.length} timeline đang chờ duyệt
          </p>
        </div>
        <button
          onClick={fetchTimelines}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          Làm mới
        </button>
      </div>

      {timelines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Không có timeline nào đang chờ duyệt</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timelines.map(timeline => {
            const isExpanded = expandedTimelineId === timeline._id;
            const supplies = timelineSupplies[timeline._id] || [];
            const vehicles = timelineVehicles[timeline._id] || [];

            return (
              <div key={timeline._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => handleToggleExpand(timeline._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">{getMissionName(timeline)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Đội: {getTeamName(timeline)} • Timeline: #{timeline._id.slice(-6)}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200 space-y-6">
                    {/* Supplies */}
                    {supplies.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Vật tư ({supplies.length})</h3>
                        <div className="space-y-2">
                          {supplies.map(supply => (
                            <div
                              key={supply._id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{getSupplyName(supply)}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Yêu cầu: {supply.requestedQty} {getSupplyUnit(supply)}
                                </p>
                                {supply.status !== "RESERVED" && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Trạng thái: {supply.status}
                                  </p>
                                )}
                              </div>
                              {supply.status === "RESERVED" && (
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleApproveSupply(supply._id, supply.requestedQty)}
                                    disabled={processingItem === supply._id}
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectSupply(supply._id)}
                                    disabled={processingItem === supply._id}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vehicles */}
                    {vehicles.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Phương tiện ({vehicles.length})</h3>
                        <div className="space-y-2">
                          {vehicles.map(vehicle => (
                            <div
                              key={vehicle._id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{getVehicleName(vehicle)}</p>
                                <p className="text-sm text-gray-600 mt-1">{getVehicleType(vehicle)}</p>
                                {vehicle.status !== "RESERVED" && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Trạng thái: {vehicle.status}
                                  </p>
                                )}
                              </div>
                              {vehicle.status === "RESERVED" && (
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleApproveVehicle(vehicle._id)}
                                    disabled={processingItem === vehicle._id}
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectVehicle(vehicle._id)}
                                    disabled={processingItem === vehicle._id}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {supplies.length === 0 && vehicles.length === 0 && (
                      <p className="text-center text-gray-500 py-4">Không có vật tư hoặc phương tiện</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
