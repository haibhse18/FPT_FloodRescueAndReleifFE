import Link from "next/link";

interface QuickAction {
    icon: string;
    title: string;
    description: string;
    color: string;
    href?: string;
}

interface QuickActionsListProps {
    actions?: QuickAction[];
}

export default function QuickActionsList({ actions }: QuickActionsListProps) {
    const defaultActions: QuickAction[] = [
        {
            icon: "🍚",
            title: "Cứu trợ thực phẩm",
            description: "Yêu cầu cơm, nước uống khẩn cấp",
            color: "orange",
            href: "/citizens/request-food",
        },
        {
            icon: "⚠️",
            title: "Đăng ký tình nguyện",
            description: "Tham gia hỗ trợ cộng đồng khi cần",
            color: "red",
        },
        {
            icon: "🛡️",
            title: "Hướng dẫn an toàn",
            description: "Kỹ năng sinh tồn khi có lũ",
            color: "blue",
            href: "/citizens/safety-guide",
        },
    ];

    const quickActions = actions || defaultActions;

    return (
        <div className="flex flex-col gap-4">
            {quickActions.map((action, index) => {
                const content = (
                    <>
                        <div
                            className={`flex items-center justify-center rounded-xl shrink-0 w-14 h-14 text-3xl ${action.color === "orange"
                                ? "bg-orange-500/10"
                                : action.color === "red"
                                    ? "bg-red-500/10"
                                    : "bg-blue-500/10"
                                }`}
                        >
                            {action.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-base lg:text-lg font-bold text-white mb-1">
                                {action.title}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {action.description}
                            </p>
                        </div>
                        <div className="shrink-0 text-gray-500">
                            <span className="text-2xl">›</span>
                        </div>
                    </>
                );

                if (!action.href) {
                    return (
                        <button
                            key={index}
                            type="button"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 transition-all duration-200"
                        >
                            {content}
                        </button>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={action.href}
                        className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
