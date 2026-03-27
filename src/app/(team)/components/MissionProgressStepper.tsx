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
  { id: 2, vietnameseLabel: "Nhận vật tư", status: ["CLAIMING_SUPPLIES"] },
  { id: 3, vietnameseLabel: "Đường đi", status: ["EN_ROUTE"] },
  { id: 4, vietnameseLabel: "Tiến độ", status: ["ON_SITE"] },
  { id: 5, vietnameseLabel: "Tổng kết", status: ["COMPLETED", "PARTIAL", "FAILED", "WITHDRAWN", "CANCELLED"] },
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
