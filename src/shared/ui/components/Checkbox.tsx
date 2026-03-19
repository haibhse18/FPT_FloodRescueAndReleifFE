import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, children, className = '', ...props }: CheckboxProps & { children?: React.ReactNode }) {
  return (
    <label className={`inline-flex items-start gap-3 cursor-pointer group ${className}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 border-2 border-white/20 rounded transition-all
          peer-checked:bg-[#FF7700] peer-checked:border-[#FF7700]
          peer-focus:ring-2 peer-focus:ring-[#FF7700]/30
          group-hover:border-[#FF7700]/50 bg-black/20 relative flex items-center justify-center
          peer-checked:[&_svg]:opacity-100">
          <Check 
            size={14} 
            strokeWidth={3}
            color="white"
            className="opacity-0 transition-opacity"
          />
        </div>
      </div>
      {(label || children) && (
        <div className="text-sm select-none">
          {label}
          {children}
        </div>
      )}
    </label>
  );
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Radio({ label, children, className = '', ...props }: RadioProps & { children?: React.ReactNode }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer group ${className}`}>
      <div className="relative">
        <input
          type="radio"
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 border-2 border-white/20 rounded-full transition-all
          peer-checked:border-[#FF7700] peer-focus:ring-2 peer-focus:ring-[#FF7700]/30
          group-hover:border-[#FF7700]/50 bg-black/20">
          <div className="absolute inset-1 bg-[#FF7700] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {(label || children) && (
        <span className="text-sm select-none">
          {label}
          {children}
        </span>
      )}
    </label>
  );
}
