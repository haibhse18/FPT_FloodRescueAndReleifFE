import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export interface FooterProps {
  variant?: 'light' | 'dark';
}

export function Footer({ variant = 'dark' }: FooterProps) {
  const bgColor = variant === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)]';
  const textColor = variant === 'dark' ? 'text-[var(--color-text-inverse)]' : 'text-[var(--color-text-primary)]';
  
  return (
    <footer className={`${bgColor} ${textColor} py-8 px-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm">Follow us:</span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div className="text-sm opacity-80">
            © 2026 Your Company. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
