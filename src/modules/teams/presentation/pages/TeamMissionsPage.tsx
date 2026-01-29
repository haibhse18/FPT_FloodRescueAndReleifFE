import { ActionCard } from "@/shared/ui/components/Card";

export default function TeamMissionsPage() {
    const dashboardItems = [
        { icon: "📝", title: "Assigned Requests", description: "Yêu cầu được phân công" },
        { icon: "📍", title: "Location", description: "Cập nhật vị trí" },
        { icon: "📊", title: "Progress", description: "Báo cáo tiến độ" },
        { icon: "🗺️", title: "Navigation", description: "Chỉ đường" },
        { icon: "👥", title: "Team Members", description: "Thành viên đội" },
        { icon: "🛠️", title: "Equipment", description: "Trang thiết bị" },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-primary)] p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[var(--color-text-inverse)] mb-6">🚑 Rescue Team Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardItems.map((item, index) => (
                        <ActionCard
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
