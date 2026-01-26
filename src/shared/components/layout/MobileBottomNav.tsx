"use client";

import Link from "next/link";

interface NavItem {
    icon: string;
    label: string;
    href: string;
}

interface MobileBottomNavProps {
    items?: NavItem[];
    currentPath?: string;
}

export default function MobileBottomNav({ items, currentPath = "/citizen" }: MobileBottomNavProps) {
    const defaultItems: NavItem[] = [
        { icon: "🏠", label: "TRANG CHỦ", href: "/citizen" },
        { icon: "📜", label: "LỊCH SỬ", href: "/citizen/history" },
        { icon: "🔔", label: "THÔNG BÁO", href: "/citizen/notifications" },
        { icon: "👤", label: "CÁ NHÂN", href: "/citizen/profile" },
    ];

    const navItems = items || defaultItems;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
            <div className="flex justify-around items-center">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 ${
                            currentPath === item.href ? "text-primary" : "text-gray-400"
                        }`}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
