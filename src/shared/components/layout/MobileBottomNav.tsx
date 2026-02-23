"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface MobileBottomNavProps {
  items?: NavItem[];
  /** Map href → unread badge count (shown when > 0) */
  badges?: Record<string, number>;
}

const DEFAULT_ITEMS: NavItem[] = [
  { icon: "🏠", label: "Trang chủ", href: "/home" },
  { icon: "📜", label: "Lịch sử", href: "/history" },
  { icon: "🔔", label: "Thông báo", href: "/notifications" },
  { icon: "👤", label: "Tôi", href: "/profile" },
];

export default function MobileBottomNav({
  items = DEFAULT_ITEMS,
  badges = {},
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f2a3f]/95 backdrop-blur-md border-t border-white/10 pb-safe z-50">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => {
          // Check if active (exact match or parent path match, handling root / specially)
          const isActive =
            pathname === item.href ||
            (pathname !== "/" &&
              pathname.startsWith(item.href) &&
              item.href !== "/");

          return (
            <li key={item.href} className="w-full">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center h-full w-full py-2 transition-all duration-300 ${isActive ? "text-[#FF7700]" : (
                    "text-gray-400 hover:text-gray-200"
                  )
                  }`}
              >
                <div
                  className={`relative text-2xl transition-transform duration-300 mb-1 ${isActive ? "scale-110 -translate-y-1" : ""
                    }`}
                >
                  {item.icon}
                  {(badges[item.href] ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                      {badges[item.href] > 99 ? "99+" : badges[item.href]}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70"
                    }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#FF7700] animate-pulse" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
