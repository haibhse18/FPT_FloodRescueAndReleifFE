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
        <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 lg:w-64 border-r z-40" style={{ background: '#133249', borderColor: 'rgba(255, 119, 0, 0.3)' }}>
            {/* Logo Section */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 119, 0, 0.3)', background: 'rgba(255, 119, 0, 0.05)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)' }}>
                        🛟
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Cứu hộ Lũ lụt</h1>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: 'rgba(255, 119, 0, 0.8)' }}>FPT Flood Rescue</p>
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
                                    className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                                    style={isActive
                                        ? { background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)', color: 'white', boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)' }
                                        : { color: 'rgba(255, 255, 255, 0.6)' }}
                                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(255, 119, 0, 0.1)', e.currentTarget.style.color = '#ff7700')}
                                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
                                >
                                    <span className={`text-xl transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
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
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 119, 0, 0.3)', background: 'rgba(255, 119, 0, 0.05)' }}>
                <Link
                    href="/citizens/profile"
                    className="group flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'rgba(255, 119, 0, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 119, 0, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 119, 0, 0.1)'}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)' }}>
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{userName}</p>
                        <p className="text-xs" style={{ color: 'rgba(255, 119, 0, 0.8)' }}>{userRole}</p>
                    </div>
                    <span className="transition-colors text-lg" style={{ color: '#ff7700' }}>›</span>
                </Link>
            </div>
        </aside>
    );
}
