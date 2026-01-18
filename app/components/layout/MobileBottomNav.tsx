interface NavItem {
    icon: string;
    label: string;
    active: boolean;
}

interface MobileBottomNavProps {
    items?: NavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
    const defaultItems: NavItem[] = [
        { icon: "🏠", label: "TRANG CHỦ", active: true },
        { icon: "📜", label: "LỊCH SỬ", active: false },
        { icon: "🔔", label: "THÔNG BÁO", active: false },
        { icon: "👤", label: "CÁ NHÂN", active: false },
    ];

    const navItems = items || defaultItems;

    return (
        <nav className="lg:hidden sticky bottom-0 bg-secondary/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
            <div className="flex justify-around items-center">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        className={`flex flex-col items-center gap-1 ${item.active ? "text-primary" : "text-gray-400"
                            }`}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
