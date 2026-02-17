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
}

const DEFAULT_ITEMS: NavItem[] = [
  { icon: "🏠", label: "Home", href: "/home" },
  { icon: "📜", label: "Lịch sử", href: "/history" },
  { icon: "🔔", label: "Thông báo", href: "/notifications" },
  { icon: "👤", label: "Tôi", href: "/profile" },
];

export default function MobileBottomNav({
  items = DEFAULT_ITEMS,
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
                className={`flex flex-col items-center justify-center h-full w-full py-2 transition-all duration-300 ${
                  isActive ? "text-[#FF7700]" : (
                    "text-gray-400 hover:text-gray-200"
                  )
                }`}
              >
                <div
                  className={`text-2xl transition-transform duration-300 mb-1 ${
                    isActive ? "scale-110 -translate-y-1" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-70"
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
