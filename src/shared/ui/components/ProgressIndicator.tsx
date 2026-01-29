import React from 'react';

export interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  variant?: 'dots' | 'bar';
}

export function ProgressIndicator({ steps, currentStep, variant = 'dots' }: ProgressIndicatorProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: steps }).map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentStep
                ? 'bg-[var(--color-accent)] scale-125'
                : index < currentStep
                ? 'bg-[var(--color-teal-medium)]'
                : 'bg-[var(--color-teal-pale)]'
            }`}
          />
        ))}
      </div>
    );
  }
  
  const progress = ((currentStep + 1) / steps) * 100;
  
  return (
    <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-[var(--color-accent)] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
