import React from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export function Avatar({ src, alt, size = 'md', fallback, status }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden`}>
        {src ? (
          <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
        ) : fallback ? (
          <span className="font-semibold text-[var(--color-text-primary)]">
            {fallback}
          </span>
        ) : (
          <User className="text-[var(--color-text-muted)]" size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 32} />
        )}
      </div>
      
      {status && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[status]} border-2 border-white rounded-full`} />
      )}
    </div>
  );
}
