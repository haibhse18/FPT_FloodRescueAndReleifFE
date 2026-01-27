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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg pb-6 pt-2" style={{ background: '#133249', borderTop: '2px solid rgba(255, 119, 0, 0.3)' }}>
            <div className="flex justify-around items-center">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="flex flex-col items-center gap-1"
                        style={{ color: currentPath === item.href ? '#ff7700' : 'rgba(255, 255, 255, 0.5)' }}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
