import { ActionCard } from "@/shared/ui/components/Card";

export default function CoordinatorRequestsPage() {
    const dashboardItems = [
        { icon: "📝", title: "All Requests", description: "Tất cả yêu cầu cứu trợ" },
        { icon: "🚑", title: "Assign Teams", description: "Phân công đội cứu hộ" },
        { icon: "👷", title: "Rescue Teams", description: "Quản lý đội cứu hộ" },
        { icon: "⚡", title: "Priority", description: "Quản lý ưu tiên" },
        { icon: "🗺️", title: "Map View", description: "Xem bản đồ" },
        { icon: "📊", title: "Reports", description: "Báo cáo điều phối" },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-primary)] p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[var(--color-text-inverse)] mb-6">📋 Coordinator Dashboard</h1>

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
