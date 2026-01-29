"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

interface DesktopSidebarProps {
  userName?: string;
  userRole?: string;
}

export default function DesktopSidebar({
  userName = "User Account",
  userRole = "Citizen",
}: DesktopSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: "🏠", label: "Trang chủ", href: "/citizen" },
    { icon: "📜", label: "Lịch sử", href: "/citizen/history" },
    { icon: "🔔", label: "Thông báo", href: "/citizen/notifications" },
    { icon: "👤", label: "Cá nhân", href: "/citizen/profile" },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 lg:w-64 bg-gradient-to-b from-white/5 to-white/[0.02] border-r border-white/10 z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-2xl shadow-lg">
            🛟
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--color-text-inverse)] tracking-tight">
              Cứu hộ Lũ lụt
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold mt-0.5">
              FPT Flood Rescue
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 overflow-y-auto">
        <ul className="space-y-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`group relative w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-200 ${
                    isActive ?
                      "bg-blue-600 text-white shadow-xl shadow-blue-900/20"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-2xl transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-lg">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Footer */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <Link
          href="/citizen/profile"
          className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate group-hover:text-blue-200 transition-colors">
              {userName}
            </p>
            <p className="text-sm text-gray-400 font-medium">{userRole}</p>
          </div>
          <span className="text-gray-500 group-hover:text-white transition-colors text-2xl">
            ›
          </span>
        </Link>
      </div>
    </aside>
  );
}
