"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  subtitle?: string;
}

export default function Sidebar({
  navItems,
  user = { name: "User Account", role: "Member" },
  title = "Cứu hộ Lũ lụt",
  subtitle = "FPT Flood Rescue",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 lg:w-64 bg-gradient-to-b from-[#133249] to-[#0f2a3f] border-r border-white/10 z-40 shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/10">
            🛟
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1">
              {title}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (pathname !== "/" &&
                pathname.startsWith(item.href) &&
                item.href !== "/");

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                    isActive ?
                      "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-2xl transition-transform duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-wide">
                    {item.label}
                  </span>

                  {item.badge && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm transform transition-transform duration-300 ${
                        isActive ?
                          "bg-white text-[var(--color-primary)] scale-110"
                        : "bg-red-500 text-white group-hover:scale-110"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <Link
          href="/profile"
          className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 border border-white/5 hover:border-white/10"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 font-medium truncate group-hover:text-gray-300 transition-colors">
              {user.role}
            </p>
          </div>
          <span className="text-gray-500 group-hover:text-white transition-colors text-lg">
            ›
          </span>
        </Link>
      </div>
    </aside>
  );
}
