import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'dark' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '',
  onClick,
  hover = false
}: CardProps) {
  const variants = {
    default: 'bg-white border border-[var(--color-border)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-text-primary)]',
    dark: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
    glass: 'bg-white/5 border border-white/10 backdrop-blur-sm'
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hover ? 'hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 cursor-pointer' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`rounded-xl shadow-md ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'accent';
}

export function InfoCard({ icon, title, description, variant = 'default' }: InfoCardProps) {
  const iconBg = variant === 'accent' ? 'bg-white' : 'bg-[var(--color-accent)]';
  
  return (
    <Card variant={variant} padding="lg">
      <div className="flex items-start gap-4">
        <div className={`${iconBg} rounded-full p-3 shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="mb-2 uppercase tracking-wide font-semibold">{title}</h4>
          <p className={variant === 'accent' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}>
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * ActionCard - for dashboard quick actions
 */
export interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function ActionCard({ icon, title, description, onClick, className = '' }: ActionCardProps) {
  return (
    <Card 
      variant="glass" 
      padding="md" 
      hover 
      onClick={onClick}
      className={className}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)]">{description}</p>
    </Card>
  );
}

// Default export for backward compatibility
export default Card;
