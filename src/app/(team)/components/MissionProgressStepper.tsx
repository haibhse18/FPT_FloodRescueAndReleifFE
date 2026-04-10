"use client";

import type { TimelineStatus } from "@/modules/timelines/domain/timeline.entity";
import Stepper, { type StepItem } from "@/shared/ui/components/Stepper";

interface Step {
  id: number;
  vietnameseLabel: string;
  status: TimelineStatus[];
}

const STEPS: Step[] = [
  { id: 1, vietnameseLabel: "Tiếp nhận", status: ["ASSIGNED"] },
  { id: 2, vietnameseLabel: "Nhận vật tư", status: ["PENDING_APPROVAL", "CLAIMING_SUPPLIES"] },
  { id: 3, vietnameseLabel: "Đường đi", status: ["EN_ROUTE"] },
  { id: 4, vietnameseLabel: "Tiến độ", status: ["ON_SITE"] },
  { id: 5, vietnameseLabel: "Tổng kết", status: ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"] },
];

interface MissionProgressStepperProps {
  currentStatus: TimelineStatus | string;
  onStepClick?: (stepIndex: number) => void;
  viewingStep?: number;
  compact?: boolean;
}

const normalizeTimelineStatus = (status: string): TimelineStatus | "UNKNOWN" => {
  const normalized = status?.trim().toUpperCase();

  if (normalized === "PENDING_APPROVAL" || normalized === "CLAIMING_SUPPLIES") {
    return normalized as TimelineStatus;
  }

  if (normalized.includes("APPROVAL") || (normalized.includes("CLAIM") && normalized.includes("SUPPL"))) {
    return "CLAIMING_SUPPLIES";
  }

  const knownStatuses: TimelineStatus[] = [
    "ASSIGNED",
    "EN_ROUTE",
    "ON_SITE",
    "COMPLETED",
    "PARTIAL",
    "FAILED",
    "WITHDRAWN",
    "CANCELLED",
  ];

  if (knownStatuses.includes(normalized as TimelineStatus)) {
    return normalized as TimelineStatus;
  }

  return "UNKNOWN";
};

export default function MissionProgressStepper({ currentStatus, onStepClick, viewingStep, compact = false }: MissionProgressStepperProps) {
  const getCurrentStepIndex = () => {
    const normalizedStatus = normalizeTimelineStatus(String(currentStatus || ""));
    const matchedIndex = STEPS.findIndex(step => step.status.includes(normalizedStatus as TimelineStatus));
    return matchedIndex >= 0 ? matchedIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const stepItems: StepItem[] = STEPS.map(step => ({
    id: step.id,
    label: step.vietnameseLabel,
  }));

  return (
    <Stepper
      steps={stepItems}
      currentStepIndex={currentStepIndex}
      viewingStepIndex={viewingStep}
      onStepClick={onStepClick}
      compact={compact}
    />
  );
}
