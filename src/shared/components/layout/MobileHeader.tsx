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
    userRole = "Citizen"
}: DesktopSidebarProps) {
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { icon: "🏠", label: "Trang chủ", href: "/citizens" },
        { icon: "📜", label: "Lịch sử", href: "/citizens/history" },
        { icon: "🔔", label: "Thông báo", href: "/citizens/notifications" },
        { icon: "👤", label: "Cá nhân", href: "/citizens/profile" },
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
                        <h1 className="text-xl font-black text-[var(--color-text-inverse)] tracking-tight">Cứu hộ Lũ lụt</h1>
                        <p className="text-xs text-[var(--color-text-muted)] font-semibold mt-0.5">FPT Flood Rescue</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
                                            ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-[var(--color-text-primary)] shadow-lg"
                                            : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-inverse)]"
                                        }`}
                                >
                                    <span className={`text-xl transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto bg-[var(--color-error)] text-[var(--color-text-inverse)] text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
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
                    href="/citizens/profile"
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-[var(--color-text-primary)] font-bold shadow-md">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--color-text-inverse)] truncate">{userName}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{userRole}</p>
                    </div>
                    <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors text-lg">›</span>
                </Link>
            </div>
        </aside>
    );
}
