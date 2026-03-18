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
    bgColor = "bg-transparent backdrop-blur-sm border-b border-white/5";
    textColor = "text-white";
  }

  return (
    <nav className={`${bgColor} ${textColor} py-4 px-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {logo || <div className="text-xl font-bold">Logo</div>}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/"
            className={`${textColor} hover:opacity-80 transition-opacity`}
          >
            Home
          </a>
          <a
            href="#"
            className={`${textColor} hover:opacity-80 transition-opacity`}
          >
            About
          </a>
          <a
            href="#"
            className={`${textColor} hover:opacity-80 transition-opacity`}
          >
            Services
          </a>
          <a
            href="#"
            className={`${textColor} hover:opacity-80 transition-opacity`}
          >
            Contact
          </a>
          {actions && (
            <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-200/20">
              {actions}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ?
            <X size={24} />
          : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-[var(--color-border)] animate-in slide-in-from-top duration-200">
          <a
            href="/"
            className={`block ${textColor} py-2 hover:opacity-80 transition-all`}
          >
            Home
          </a>
          <a
            href="#"
            className={`block ${textColor} py-2 hover:opacity-80 transition-all`}
          >
            About
          </a>
          <a
            href="#"
            className={`block ${textColor} py-2 hover:opacity-80 transition-all`}
          >
            Services
          </a>
          <a
            href="#"
            className={`block ${textColor} py-2 hover:opacity-80 transition-all`}
          >
            Contact
          </a>
          {actions && (
            <div className="mt-4 pt-4 border-t border-gray-200/10 flex flex-col gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
