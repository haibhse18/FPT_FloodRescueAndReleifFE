"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from 'lucide-react';

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
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 lg:w-64 bg-white border-r border-gray-100 z-40 shadow-sm">
      {/* Logo Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-xl text-white shadow-sm">
             <Shield />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-2">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
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
                  className={`group relative w-full flex items-center gap-4 px-8 py-3 transition-colors duration-200 ${
                    isActive ?
                      "text-gray-900 font-bold border-l-4 border-emerald-700"
                    : "text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={`text-xl transition-colors duration-200 ${
                      isActive ? "text-emerald-700" : "text-gray-400 group-hover:text-emerald-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm tracking-wide">
                    {item.label}
                  </span>

                  {item.badge && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold rounded-md min-w-[24px] h-5 flex items-center justify-center px-1.5 ${
                        isActive ?
                          "bg-emerald-700 text-white"
                        : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Footer - matching the mobile app download card from the image */}
      <div className="p-6">
        <div className="p-5 rounded-2xl bg-emerald-900 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold border border-white/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-emerald-200 font-medium truncate">
                  {user.role}
                </p>
              </div>
            </div>
            
            <Link
              href="/profile"
              className="block w-full text-center py-2 bg-emerald-700 hover:bg-emerald-600 transition-colors rounded-xl text-xs font-bold"
            >
              Xem Hồ Sơ
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
