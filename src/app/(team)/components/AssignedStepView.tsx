"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimes, FaUsers, FaBoxOpen, FaMapMarkerAlt, FaBell } from "react-icons/fa";
import GoongTeamMissionMap from "@/modules/map/presentation/components/GoongTeamMissionMap";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import AcceptMissionForm from "./AcceptMissionForm";
import type { Mission } from "@/modules/missions/domain/mission.entity";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import type { AcceptTimelineInput } from "@/modules/timelines/domain/timeline.entity";

interface AssignedStepViewProps {
  mission: Mission;
  missionRequests: MissionRequest[];
  onAccept: (payload?: AcceptTimelineInput) => void;
  onReject: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function AssignedStepView({
  mission,
  missionRequests,
  onAccept,
  onReject,
  loading = false,
  disabled = false,
}: AssignedStepViewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showForm, setShowForm] = useState(false);

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

  // Summary metrics are provided by mission detail API.
  const totalPeople = Number(mission.peopleCount) || 0;

  const totalRequests = missionRequests.length;

  const totalSupplies = Number(mission.totalSupply) || 0;

  const missionId = typeof mission._id === 'string' ? mission._id : (mission._id as any);

  const handleFormSubmit = (payload: AcceptTimelineInput) => {
    onAccept(payload);
  };

  if (showForm) {
    return (
      <div className="h-full">
        <AcceptMissionForm
          missionId={missionId}
          onSubmit={handleFormSubmit}
          onBack={() => setShowForm(false)}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Map Section - 65% */}
      <div className="lg:col-span-2 h-full overflow-hidden">
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
      <div className="lg:col-span-1 h-full overflow-y-auto scrollbar-hide pr-2 space-y-4">
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

        {/* Warehouse Info */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkerAlt className="text-mission-icon-location text-lg" />
            <h4 className="text-sm font-bold text-mission-text-primary uppercase tracking-wide">Warehouse</h4>
          </div>
          <p className="text-mission-text-primary font-semibold">{(mission as any).warehouseName || "N/A"}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowForm(true)}
            disabled={loading || disabled}
            className="w-full px-6 py-4 rounded-xl bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
          >
            <FaCheckCircle className="text-lg" />
            Accept Mission
          </button>

          <button
            onClick={onReject}
            disabled={loading || disabled}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-mission-action-reject hover:bg-white/10 hover:text-mission-action-reject-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FaTimes />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
