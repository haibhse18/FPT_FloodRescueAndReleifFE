import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-text-primary)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success-dark)] border border-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning-dark)] border border-[var(--color-warning)]',
    danger: 'bg-[var(--color-error-light)] text-[var(--color-error-dark)] border border-[var(--color-error)]'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
