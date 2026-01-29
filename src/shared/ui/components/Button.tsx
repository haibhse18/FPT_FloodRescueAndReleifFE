import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  isLoading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  fullWidth = false,
  href,
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg';
  
  const variants = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-dark)]',
    secondary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-dark)]',
    outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] shadow-none',
    ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-surface)] shadow-none',
    danger: 'bg-[var(--color-error)] text-[var(--color-text-inverse)] hover:bg-[var(--color-error-dark)]'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const finalClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;
  const isDisabled = disabled || isLoading;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} className={finalClassName}>
        {isLoading && <LoadingSpinner />}
        {children}
      </Link>
    );
  }

  return (
    <button 
      className={finalClassName}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Default export for backward compatibility
export default Button;
