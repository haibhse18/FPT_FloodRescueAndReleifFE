import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  dismissible = false, 
  onDismiss 
}: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-[var(--color-info-light)]',
      border: 'border-[var(--color-info)]',
      text: 'text-[var(--color-info-dark)]',
      icon: <Info size={20} />
    },
    success: {
      bg: 'bg-[var(--color-success-light)]',
      border: 'border-[var(--color-success)]',
      text: 'text-[var(--color-success-dark)]',
      icon: <CheckCircle size={20} />
    },
    warning: {
      bg: 'bg-[var(--color-warning-light)]',
      border: 'border-[var(--color-warning)]',
      text: 'text-[var(--color-warning-dark)]',
      icon: <AlertTriangle size={20} />
    },
    error: {
      bg: 'bg-[var(--color-error-light)]',
      border: 'border-[var(--color-error)]',
      text: 'text-[var(--color-error-dark)]',
      icon: <AlertCircle size={20} />
    }
  };
  
  const style = variants[variant];
  
  return (
    <div className={`${style.bg} ${style.border} ${style.text} border rounded-lg p-4 animate-in slide-in-from-top duration-300`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          {title && <h5 className="font-semibold mb-1">{title}</h5>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="shrink-0 hover:opacity-70 hover:scale-110 transition-all duration-200"
            aria-label="Dismiss alert"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
