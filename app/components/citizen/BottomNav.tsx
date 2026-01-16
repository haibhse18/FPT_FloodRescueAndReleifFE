"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/citizen", label: "Home", icon: "🏠" },
  { href: "/citizen/report", label: "Báo cáo", icon: "🚨" },
  { href: "/citizen/status", label: "Trạng thái", icon: "📍" },
  { href: "/citizen/profile", label: "Cá nhân", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center text-xs ${
              active ? "text-blue-600 font-semibold" : "text-gray-400"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
