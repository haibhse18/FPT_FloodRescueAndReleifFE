"use client";

import { FaCheckCircle } from "react-icons/fa";
import type { TimelineStatus } from "@/modules/timelines/domain/timeline.entity";

interface Step {
  id: number;
  vietnameseLabel: string;
  status: TimelineStatus[];
}

const STEPS: Step[] = [
  { id: 1, vietnameseLabel: "Tiếp nhận", status: ["ASSIGNED"] },
  { id: 2, vietnameseLabel: "Đường đi", status: ["EN_ROUTE"] },
  { id: 3, vietnameseLabel: "Tiến độ", status: ["ON_SITE"] },
  { id: 4, vietnameseLabel: "Tổng kết", status: ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"] },
];

interface MissionProgressStepperProps {
  currentStatus: TimelineStatus;
  onStepClick?: (stepIndex: number) => void;
  viewingStep?: number;
  compact?: boolean;
}

export default function MissionProgressStepper({ currentStatus, onStepClick, viewingStep, compact = false }: MissionProgressStepperProps) {
  const getCurrentStepIndex = () => {
    return STEPS.findIndex(step => step.status.includes(currentStatus));
  };

  const currentStepIndex = getCurrentStepIndex();
  const displayStepIndex = viewingStep !== undefined ? viewingStep : currentStepIndex;

  return (
    <div className={`w-full ${compact ? 'py-0' : 'px-4 py-4'}`}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isViewing = index === displayStepIndex;
          const isClickable = index <= currentStepIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-start flex-1">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center rounded-full border-2 transition-all duration-500 ease-out
                    ${compact ? 'w-8 h-8' : 'w-10 h-10'}
                    ${isCompleted ? "bg-mission-status-completed border-mission-status-completed" : ""}
                    ${isCurrent && !isCompleted ? "bg-mission-status-assigned border-mission-status-assigned shadow-lg shadow-mission-status-assigned/50" : ""}
                    ${!isCompleted && !isCurrent ? "bg-mission-status-pending/20 border-mission-status-pending" : ""}
                    ${isViewing && !isCurrent ? "ring-2 ring-mission-status-assigned/50" : ""}
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-60"}
                  `}
                >
                  {isCompleted ? (
                    <FaCheckCircle className={`text-white ${compact ? 'text-sm' : 'text-base'}`} />
                  ) : (
                    <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'} ${isCurrent ? "text-white" : "text-mission-text-muted"}`}>
                      {step.id}
                    </span>
                  )}
                </button>
                <div className={`${compact ? 'mt-1' : 'mt-2'} text-center`}>
                  <div className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-medium ${
                    isViewing ? "text-white" : isCurrent ? "text-white" : "text-mission-text-subtle"
                  }`}>
                    {step.vietnameseLabel}
                  </div>
                </div>
              </div>

              {/* Connector Line - Aligned horizontally with circles */}
              {!isLast && (
                <div className="flex-1 flex items-start mx-2" style={{ marginTop: compact ? '14px' : '18px' }}>
                  <div className="w-full h-1.5 rounded-sm overflow-hidden bg-mission-status-pending/30">
                    <div
                      className={`
                        h-full rounded-sm transition-all duration-500 ease-out origin-left
                        ${isCompleted ? "bg-mission-status-completed scale-x-100" : "scale-x-0"}
                      `}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
