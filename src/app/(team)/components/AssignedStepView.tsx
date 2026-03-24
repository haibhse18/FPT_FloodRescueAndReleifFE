"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimes, FaUsers, FaBoxOpen, FaMapMarkerAlt, FaBell } from "react-icons/fa";
import GoongTeamMissionMap from "@/modules/map/presentation/components/GoongTeamMissionMap";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

interface AssignedStepViewProps {
  mission: Mission;
  missionRequests: MissionRequest[];
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

export default function AssignedStepView({
  mission,
  missionRequests,
  onAccept,
  onReject,
  loading = false,
}: AssignedStepViewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

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
  }, []);

  // Calculate summary statistics
  const totalPeople = missionRequests.reduce((sum, mr) => {
    const peopleNeeded = (mr as any).requestPeopleSnapshot || (mr as any).peopleNeeded || 0;
    return sum + peopleNeeded;
  }, 0);

  const totalRequests = missionRequests.length;

  const suppliesNeeded = missionRequests.reduce((acc, mr) => {
    const supplies = (mr as any).requestSuppliesSnapshot || [];
    supplies.forEach((item: any) => {
      const name = item.supplyId?.name || item.name || "Vật tư";
      const qty = item.requestedQty || 0;
      const unit = item.unit || item.supplyId?.unit || "";
      
      if (!acc[name]) {
        acc[name] = { quantity: 0, unit };
      }
      acc[name].quantity += qty;
    });
    return acc;
  }, {} as Record<string, { quantity: number; unit: string }>);

  const totalSupplies = Object.keys(suppliesNeeded).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
      {/* Map Section - 65% */}
      <div className="lg:col-span-2 h-full">
        <GoongTeamMissionMap
          step="assigned"
          missionRequests={missionRequests}
          warehouses={warehouses}
          selectedRequestId={selectedRequestId}
          onRequestClick={setSelectedRequestId}
          className="h-full"
        />
      </div>

      {/* Summary Panel - 35% - Scrollable */}
      <div className="lg:col-span-1 h-full overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-mission-text-primary">
          <FaBell className="text-mission-icon-people text-lg" />
          <h3 className="text-sm font-bold uppercase tracking-wide">MISSION SUMMARY</h3>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          {/* Total Rescue */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-mission-status-assigned/20 flex items-center justify-center flex-shrink-0">
                <FaUsers className="text-mission-icon-people text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-mission-text-muted uppercase tracking-wide mb-1">Total Rescue</p>
                <p className="text-4xl font-bold text-mission-text-primary">{totalPeople}</p>
              </div>
            </div>
          </div>

          {/* Supplies */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-mission-status-warning/20 flex items-center justify-center flex-shrink-0">
                <FaBoxOpen className="text-mission-icon-supplies text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-mission-text-muted uppercase tracking-wide mb-1">Supplies</p>
                <p className="text-4xl font-bold text-mission-text-primary">{totalSupplies}</p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-mission-status-critical/20 flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="text-mission-icon-location text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-mission-text-muted uppercase tracking-wide mb-1">Locations</p>
                <p className="text-4xl font-bold text-mission-text-primary">{totalRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distance & Time */}
        <div className="flex items-center justify-between text-sm px-2">
          <div className="text-mission-text-muted">
            <span className="font-medium">Distance:</span> <span className="text-mission-text-primary">4.2 mi</span>
          </div>
          <div className="text-mission-text-muted">
            <span className="font-medium">Est. Time:</span> <span className="text-mission-text-primary">45 min</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onAccept}
            disabled={loading}
            className="w-full px-6 py-4 rounded-xl bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle className="text-lg" />
                Accept Mission
              </>
            )}
          </button>

          <button
            onClick={onReject}
            disabled={loading}
            className="w-full px-4 py-2 text-mission-action-reject hover:text-mission-action-reject-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FaTimes />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
