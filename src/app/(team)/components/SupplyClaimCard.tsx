"use client";

import { FaBoxOpen, FaCheckCircle, FaWarehouse } from "react-icons/fa";
import type { MissionSupply } from "@/modules/supplies/domain/missionSupply.entity";
import type { TimelineSupply } from "@/modules/supplies/domain/timelineSupply.entity";

interface SupplyClaimCardProps {
  missionSupply: MissionSupply;
  timelineSupply?: TimelineSupply;
  onClaim: (missionSupplyId: string, allocatedQty: number, supplyName: string, warehouseName: string) => void;
  loading?: boolean;
}

export default function SupplyClaimCard({
  missionSupply,
  timelineSupply,
  onClaim,
  loading = false,
}: SupplyClaimCardProps) {
  const isClaimed = !!timelineSupply;
  const claimedQty = timelineSupply?.carriedQty || 0;
  const allocatedQty = missionSupply.allocatedQty;
  const progressPercent = allocatedQty > 0 ? (claimedQty / allocatedQty) * 100 : 0;
  
  const supplyName = typeof missionSupply.supplyId === 'object' 
    ? missionSupply.supplyId.name 
    : 'Unknown Supply';
  
  const unit = typeof missionSupply.supplyId === 'object' 
    ? missionSupply.supplyId.unit 
    : '';
  
  const warehouseName = typeof missionSupply.warehouseId === 'object' && missionSupply.warehouseId
    ? missionSupply.warehouseId.name 
    : 'Chưa xác định';

  const handleClaimClick = () => {
    if (!isClaimed && !loading) {
      onClaim(missionSupply._id, allocatedQty, supplyName, warehouseName);
    }
  };

  return (
    <div className={`bg-mission-bg-secondary border rounded-xl p-4 transition-all ${
      isClaimed ? 'border-mission-status-completed' : 'border-mission-border'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isClaimed 
            ? 'bg-mission-status-completed/20' 
            : 'bg-mission-status-warning/20'
        }`}>
          {isClaimed ? (
            <FaCheckCircle className="text-mission-status-completed text-xl" />
          ) : (
            <FaBoxOpen className="text-mission-icon-supplies text-xl" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-mission-text-primary mb-1 truncate">
            {supplyName}
          </h4>
          
          <div className="text-xs text-mission-text-muted mb-2">
            <span className="font-mono">[{claimedQty}]/[{allocatedQty}]</span> {unit}
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isClaimed ? 'bg-mission-status-completed' : 'bg-mission-status-assigned'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-mission-text-subtle">
            <FaWarehouse className="text-mission-icon-location" />
            <span className="truncate">{warehouseName}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        {isClaimed ? (
          <button
            disabled
            className="w-full px-3 py-2 rounded-lg bg-mission-status-completed/20 text-mission-status-completed font-medium text-sm border border-mission-status-completed/40 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaCheckCircle />
            Đã nhận
          </button>
        ) : (
          <button
            onClick={handleClaimClick}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
          >
            {loading ? 'Đang xử lý...' : 'Nhận hàng'}
          </button>
        )}
      </div>
    </div>
  );
}
