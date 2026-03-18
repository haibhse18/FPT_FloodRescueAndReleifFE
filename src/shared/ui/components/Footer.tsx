import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export interface FooterProps {
  variant?: 'light' | 'dark' | 'transparent';
}

export function Footer({ variant = 'dark' }: FooterProps) {
  let bgColor = "bg-gray-50 border-t border-gray-200";
  let textColor = "text-gray-600";
  let hoverColor = "hover:text-primary";
  
  if (variant === "dark" || variant === "transparent") {
     bgColor = variant === "dark" ? "bg-black border-t border-white/10" : "bg-transparent border-t border-white/10";
     textColor = "text-zinc-400";
     hoverColor = "hover:text-white";
  }
  
  return (
    <footer className={`${bgColor} ${textColor} py-8 px-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest">Theo dõi nhanh:</span>
            <div className="flex items-center gap-4">
              <a href="#" className={`${hoverColor} transition-colors`} aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className={`${hoverColor} transition-colors`} aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className={`${hoverColor} transition-colors`} aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className={`${hoverColor} transition-colors`} aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          <div className="text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} FloodRescue. Nền tảng Điều phối Cứu trợ Khẩn cấp.
          </div>
        </div>
      </div>
    </footer>
  );
}
