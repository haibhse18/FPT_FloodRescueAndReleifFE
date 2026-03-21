"use client";

import { FaCheckCircle } from "react-icons/fa";
import type { TimelineStatus } from "@/modules/timelines/domain/timeline.entity";

interface Step {
  id: number;
  label: string;
  vietnameseLabel: string;
  status: TimelineStatus[];
}

const STEPS: Step[] = [
  { id: 1, label: "ASSIGNED", vietnameseLabel: "Tiếp nhận", status: ["ASSIGNED"] },
  { id: 2, label: "EN ROUTE", vietnameseLabel: "Đường đi", status: ["EN_ROUTE"] },
  { id: 3, label: "IN PROGRESS", vietnameseLabel: "Tiến độ", status: ["ON_SITE"] },
  { id: 4, label: "COMPLETED", vietnameseLabel: "Tổng kết", status: ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"] },
];

interface MissionProgressStepperProps {
  currentStatus: TimelineStatus;
  onStepClick?: (stepIndex: number) => void;
  viewingStep?: number;
}

export default function MissionProgressStepper({ currentStatus, onStepClick, viewingStep }: MissionProgressStepperProps) {
  const getCurrentStepIndex = () => {
    return STEPS.findIndex(step => step.status.includes(currentStatus));
  };

  const currentStepIndex = getCurrentStepIndex();
  const displayStepIndex = viewingStep !== undefined ? viewingStep : currentStepIndex;

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isViewing = index === displayStepIndex;
          const isClickable = index <= currentStepIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${isCompleted ? "bg-mission-status-completed border-mission-status-completed" : ""}
                    ${isCurrent && !isCompleted ? "bg-mission-status-assigned border-mission-status-assigned shadow-lg shadow-mission-status-assigned/50" : ""}
                    ${!isCompleted && !isCurrent ? "bg-mission-status-pending/20 border-mission-status-pending" : ""}
                    ${isViewing && !isCurrent ? "ring-2 ring-mission-status-assigned/50" : ""}
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-60"}
                  `}
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-white text-xl" />
                  ) : (
                    <span className={`text-base font-bold ${isCurrent ? "text-white" : "text-mission-text-muted"}`}>
                      {step.id}
                    </span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <div className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isViewing ? "text-mission-status-assigned" : isCurrent ? "text-white" : "text-mission-text-muted"
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs font-medium ${
                    isViewing ? "text-white" : isCurrent ? "text-white" : "text-mission-text-subtle"
                  }`}>
                    {step.vietnameseLabel}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-3 relative" style={{ top: "-28px" }}>
                  <div
                    className={`
                      h-full transition-all
                      ${isCompleted ? "bg-mission-status-completed" : "bg-mission-status-pending/30"}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
