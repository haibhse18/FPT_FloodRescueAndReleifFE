import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
          )}
          {item.href ? (
            <a 
              href={item.href}
              className="text-[var(--color-primary)] hover:underline"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-[var(--color-text-muted)]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
