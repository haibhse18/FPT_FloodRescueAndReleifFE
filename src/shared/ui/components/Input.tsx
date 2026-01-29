import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', required, disabled, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border rounded-lg transition-all
          ${error 
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error-light)]' 
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-teal-pale)]'
          }
          ${disabled ? 'bg-[var(--color-surface)] cursor-not-allowed opacity-60' : 'bg-white'}
          outline-none ${className}`}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{helperText}</p>}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className = '', required, disabled, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 border rounded-lg transition-all resize-vertical min-h-[100px]
          ${error 
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error-light)]' 
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-teal-pale)]'
          }
          ${disabled ? 'bg-[var(--color-surface)] cursor-not-allowed opacity-60' : 'bg-white'}
          outline-none ${className}`}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{helperText}</p>}
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, helperText, options, className = '', required, disabled, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 border rounded-lg transition-all appearance-none
          ${error 
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error-light)]' 
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-teal-pale)]'
          }
          ${disabled ? 'bg-[var(--color-surface)] cursor-not-allowed opacity-60' : 'bg-white'}
          outline-none ${className}`}
        required={required}
        disabled={disabled}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{helperText}</p>}
    </div>
  );
}

// Default export for backward compatibility  
export default Input;
