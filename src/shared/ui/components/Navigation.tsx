import React from "react";
import { Menu, X } from "lucide-react";

export interface NavigationProps {
  logo?: React.ReactNode;
  variant?: "light" | "dark" | "transparent";
  actions?: React.ReactNode;
}

export function Navigation({
  logo,
  variant = "dark",
  actions,
}: NavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  let bgColor = "bg-white border-b border-border";
  let textColor = "text-foreground";
  if (variant === "dark") {
    bgColor = "bg-zinc-950 border-b border-white/10";
    textColor = "text-white";
  } else if (variant === "transparent") {
    bgColor = "bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm";
    textColor = "text-[#133249]";
  }

  const linkClass = `${textColor} font-black text-xs uppercase tracking-[0.15em] hover:text-primary transition-all relative group py-2`;

  return (
    <nav className={`${bgColor} ${textColor} py-4 px-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {logo || <div className="text-xl font-bold">Logo</div>}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <a href="/" className={linkClass}>
            Trang chủ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a href="#hoat-dong" className={linkClass}>
            Hoạt động
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a href="#y-nghia" className={linkClass}>
            Ý nghĩa
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a href="#lien-he" className={linkClass}>
            Liên hệ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          {actions && (
            <div className="flex items-center gap-4 ml-4 border-l pl-8 border-slate-200">
              {actions}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ?
            <X size={24} className="text-primary" />
          : <Menu size={24} className="text-primary" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mt-4 py-6 border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <a href="/" className={`${linkClass} text-sm px-2`}>Trang chủ</a>
            <a href="#hoat-dong" className={`${linkClass} text-sm px-2`}>Hoạt động</a>
            <a href="#y-nghia" className={`${linkClass} text-sm px-2`}>Ý nghĩa</a>
            <a href="#lien-he" className={`${linkClass} text-sm px-2`}>Liên hệ</a>
            {actions && (
              <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col gap-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
