import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'accent' | 'white';
}

export function Spinner({ size = 'md', variant = 'primary' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  const variants = {
    primary: 'border-[var(--color-primary)] border-t-transparent',
    accent: 'border-[var(--color-accent)] border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  return (
    <div className={`${sizes[size]} ${variants[variant]} rounded-full animate-spin`} />
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <Spinner size="lg" variant="primary" />
        {message && <p className="text-[var(--color-text-primary)]">{message}</p>}
      </div>
    </div>
  );
}
