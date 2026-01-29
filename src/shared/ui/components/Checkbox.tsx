import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 border-2 border-[var(--color-border)] rounded transition-all
          peer-checked:bg-[var(--color-accent)] peer-checked:border-[var(--color-accent)]
          peer-focus:ring-2 peer-focus:ring-[var(--color-teal-pale)]
          group-hover:border-[var(--color-primary)]">
          <Check 
            size={16} 
            className="absolute inset-0 text-[var(--color-text-primary)] opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>
      </div>
      {label && <span className="text-sm select-none">{label}</span>}
    </label>
  );
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Radio({ label, className = '', ...props }: RadioProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="radio"
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 border-2 border-[var(--color-border)] rounded-full transition-all
          peer-checked:border-[var(--color-accent)]
          peer-focus:ring-2 peer-focus:ring-[var(--color-teal-pale)]
          group-hover:border-[var(--color-primary)]">
          <div className="absolute inset-1 bg-[var(--color-accent)] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {label && <span className="text-sm select-none">{label}</span>}
    </label>
  );
}
